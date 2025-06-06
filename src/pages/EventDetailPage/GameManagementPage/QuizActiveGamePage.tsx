import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Button,
  Group,
  Text,
  Card,
  Loader,
  Progress,
  Box,
  Badge,
  RingProgress,
  Paper,
  SimpleGrid,
  useMantineTheme,
  Stack,
  Title,
} from '@mantine/core';
import {
  IconPlayerPause,
  IconPlayerSkipForward,
  IconChartBar,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconPodium,
  IconArrowRight,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useGetQuizById, useGetQuizQuestions } from '@/queries/useQuizQueries';
import { createStyles } from '@mantine/styles';
import { modals } from '@mantine/modals';
import { LiveLeaderboard } from '@/components/quiz/LiveLeaderboard';
import { io, Socket } from 'socket.io-client';

// Define answer option colors (Kahoot-like)
const ANSWER_COLORS = ['red', 'blue', 'yellow', 'green'];

const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    minHeight: 'calc(100vh - 60px)',
    minWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing.lg,
  },
  header: {
    borderBottom: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  questionCard: {
    backgroundColor: theme.colors.blue[7],
    color: theme.white,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    boxShadow: theme.shadows.lg,
  },
  questionText: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  timerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timer: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1,
    textAlign: 'center',
  },
  answerOption: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
    height: '100%',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.2s ease',
    boxShadow: theme.shadows.md,
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
  answerText: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 600,
    color: theme.white,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  controlButton: {
    transition: 'transform 0.2s ease',
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
  footer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.lg,
    borderTop: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
  progressLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
  },
  progressLabelInner: {
    fontSize: theme.fontSizes.xs,
    fontWeight: 500,
    color: theme.white,
    whiteSpace: 'nowrap',
  },
  questionCounter: {
    backgroundColor: theme.colors.gray[1],
    color: theme.colors.dark[7],
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.sm,
    fontWeight: 600,
    marginBottom: theme.spacing.md,
  },
}));

export const QuizActiveGamePage: React.FC = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const { eventId, showId, quizId, code } = useParams<{
    eventId: string;
    showId: string;
    quizId: string;
    code: string;
  }>();

  // Fetch quiz data
  const { data: quiz, isLoading: isQuizLoading } = useGetQuizById(
    Number(showId),
    Number(quizId),
  );

  const { data: questions, isLoading: isQuestionsLoading } =
    useGetQuizQuestions(Number(eventId), Number(quizId));

  const navigate = useNavigate();
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<any>(questions?.[0]);
  const [timeRemaining, setTimeRemaining] = useState<number>(60); // Default 30 seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [responseCount, setResponseCount] = useState<number>(0); // Number of participants who responded
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isChangingQuestion, setIsChangingQuestion] = useState<boolean>(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [recentJoins, setRecentJoins] = useState<string[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'
  >('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  // Track each participant's answer
  const [participantAnswers, setParticipantAnswers] = useState<{ [userId: string]: number }>({});

  useEffect(() => {
    if (!code || isConnected) return;

    socketRef.current = io(`${import.meta.env.VITE_API_BASE_URL}/quiz`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      auth: {
        code,
        userId: 'host-user',
        username: 'Quiz Host',
        isHost: true,
      },
    });

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleUpdateGameState = (data: any) => {
      console.log("handle update game state", data)
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setCurrentQuestion({
        ...data.question,
        startTime: data.currentQuestionStartTime
      });
    
      const newParticipants: any[] = [];
      const newParticipantAnswers: { [userId: string]: number } = {};
    
      data.participants.forEach((participant: any) => {
        if (participant.userId === 'host-user') return;
        newParticipants.push({
          userId: participant.userId,
          username: participant.username,
          score: participant.score,
          joinTime: participant.joinTime,
          questionsAnswered: participant.questionsAnswered,
          answerQuestionIndex: participant.answerQuestionIndex,
          selectedOption: participant.selectedOption,
        });
        if (participant.answerQuestionIndex === data.currentQuestionIndex && participant.selectedOption != null) {
          newParticipantAnswers[participant.userId] = participant.selectedOption;
        }
      });

      setParticipants(newParticipants);
      console.log("new participants", newParticipants)
      setParticipantAnswers(newParticipantAnswers);
    
      // Recalculate answers count from scratch
      const newAnswersCount: { [key: number]: number } = {};
      Object.values(newParticipantAnswers).forEach((selectedOption) => {
        newAnswersCount[selectedOption] = (newAnswersCount[selectedOption] || 0) + 1;
      });
    
      setAnswers(newAnswersCount);
    
      setResponseCount(Object.keys(newParticipantAnswers).length);
    
      setTimeRemaining(
        Math.max(
          0,
          data.timeLimit - Math.floor((Date.now() - data.currentQuestionStartTime) / 1000),
        ),
      );
      console.log("time remaining", timeRemaining);
      
      if (timeRemaining > 0) {
        setIsTimerRunning(true);
      } else {
        console.log('Time up');
        setIsTimerRunning(false);
        setShowResults(true);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleUserJoinedQuizForHost = (data: any) => {
      if (data.userId === 'host-user') return;
      console.log("handle user joined quiz for host", data)
      const newParticipant = {
        userId: data.userId,
        username: data.username,
        score: data.score,
        joinTime: data.timestamp,
        questionsAnswered: data.questionsAnswered,
        answerQuestionIndex: data.answerQuestionIndex,
        selectedOption: data.selectedOption,
      };
      if (participants.some((p) => p.userId == data.userId)) {
        return;
      }
      if(data.answerQuestionIndex === currentQuestionIndex){
        setResponseCount(responseCount + 1);
        setParticipantAnswers((prev) => {
          const updated = { ...prev };
          updated[data.userId] = data.selectedOption;
          return updated;
        });
        setAnswers((prev) => {
          const updated = { ...prev };
          updated[data.selectedOption] = (updated[data.selectedOption] || 0) + 1;
          return updated;
        });
      }
      setParticipants((prev) => [...prev, newParticipant]);
      setRecentJoins((prev) => [...prev, data.userId]);
    };

    const handleParticipantLeftForHost = (data: any) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
      setRecentLeaves((prev) => [...prev, data.userId]);
      if(data.answerQuestionIndex === currentQuestionIndex){
        setResponseCount(responseCount - 1);
        setParticipantAnswers((prev) => {
          const updated = { ...prev };
          delete updated[data.userId];
          return updated;
        });
        setAnswers((prev) => {
          const updated = { ...prev };
          updated[data.selectedOption] = updated[data.selectedOption] - 1;
          return updated;
        });
      }
    };

    const handleNextQuestion = (data: any) => {
      setShowResults(false);
      setAnswers({});
      setCurrentQuestionIndex(data.questionIndex);
      setCurrentQuestion({
        ...data.question,
        startTime: data.currentQuestionStartTime
      });

      setTimeRemaining(data.timeLimit);
      if (data.timeLimit > 0) {
        setIsTimerRunning(true);
      } else {
        setIsTimerRunning(false);
        setShowResults(true);
      }
    };

    // In handleAnswerSubmitted: incremental update per participant answer change
    const handleAnswerSubmitted = (data: any) => {
      setParticipantAnswers((prev) => {
        const prevSelected = prev[data.userId];
        // If answer didn't change, no update needed
        if (prevSelected === data.selectedOption) return prev;

        // Clone the mapping and update the answer
        const updated = { ...prev };
        updated[data.userId] = data.selectedOption;

        // Recalculate answer counts from updated answers
        const newAnswersCount: { [key: number]: number } = {};
        Object.values(updated).forEach((selectedOption) => {
          // Only count non-null selected options
          if (selectedOption !== null) {
            newAnswersCount[selectedOption] = (newAnswersCount[selectedOption] || 0) + 1;
          }
        });

        setAnswers(newAnswersCount);
        setResponseCount(Object.keys(updated).length);
        return updated;
      });
    };

    const handleQuizState = (data: any) => {
      console.log("handle quiz state", data)
      // Update the component state with the current quiz state
      if (data.currentQuestionIndex !== undefined) {
        setCurrentQuestionIndex(data.currentQuestionIndex);
      }
      if (data.question) {
        setCurrentQuestion({
          ...data.question,
          startTime: data.currentQuestionStartTime || Date.now()
        });
      }
      if (data.participants) {
        setParticipants(data.participants);
      }
      if (data.timeLimit !== undefined) {
        setTimeRemaining(data.timeLimit);
      }
      setIsTimerRunning(true);
      setShowResults(data.showResults || false);
    }

    const handleQuizStarted = (data: any) => {
      handleUpdateGameState({
        currentQuestionIndex: data.currentQuestionIndex,
        question: data.question,
        timeLimit: data.timeLimit,
        currentQuestionStartTime: data.currentQuestionStartTime,
        participants: data.participants || [],
      });
    }

    const handleQuizEnded = (data: any) => {
      if(data.success){
        setParticipants((data.leaderboard).filter((p)=>p.userId !== 'host-user'));
      }
    }
    
    socketRef.current?.on('connect', handleConnect);
    socketRef.current?.on('disconnect', handleDisconnect);
    socketRef.current?.on('quizStarted', handleQuizStarted);
    socketRef.current?.on('nextQuestion', handleNextQuestion);
    socketRef.current?.on('userJoinedQuizForHost', handleUserJoinedQuizForHost);
    socketRef.current?.on('updateGameState', handleUpdateGameState);
    socketRef.current?.on('participantLeftForHost', handleParticipantLeftForHost);
    socketRef.current?.on('answerSubmitted', handleAnswerSubmitted);
    socketRef.current?.on('quizEndedForHost', handleQuizEnded);
    return () => {
      socketRef.current?.off('connect', handleConnect);
      socketRef.current?.off('disconnect', handleDisconnect);
      socketRef.current?.off('quizStarted', handleQuizStarted);
      socketRef.current?.off('nextQuestion', handleNextQuestion);
      socketRef.current?.off('userJoinedQuizForHost', handleUserJoinedQuizForHost);
      socketRef.current?.off('updateGameState', handleUpdateGameState);
      socketRef.current?.off('participantLeftForHost', handleParticipantLeftForHost);
      socketRef.current?.off('answerSubmitted', handleAnswerSubmitted);
      socketRef.current?.off('quizEndedForHost', handleQuizEnded);
    };
  }, [code]);
  
  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) {
      return; // Do nothing if timer is paused or time is up
    }

    const timerId = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up
          socketRef.current?.emit('questionTimeUp', {
            code,
            questionIndex: currentQuestionIndex,
          });
          setIsTimerRunning(false);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [isTimerRunning, timeRemaining, code, currentQuestionIndex]);

  const handleClickNextQuestion = () => {
    // Check if this is the last question
    if (questions && currentQuestionIndex >= questions.length - 1) {
      showEndQuizConfirmation();
      return;
    }

    setIsChangingQuestion(true);

    // Reset participant answers and showResults flag
    setParticipantAnswers({});
    setShowResults(false);

    // Use WebSocket to notify all clients about the next question
    if (socketRef.current && isConnected) {
      // Show loading notification
      const notificationId = notifications.show({
        title: 'Next Question',
        message: 'Moving to the next question...',
        color: 'blue',
        loading: true,
        autoClose: false,
      });
      // Emit the nextQuestion event
      socketRef.current.emit('nextQuestion', { code });

      // Update notification after server response
      setTimeout(() => {
        notifications.update({
          id: notificationId,
          title: 'Next Question',
          message: 'Moving to the next question',
          color: 'blue',
          loading: false,
          autoClose: true,
        });
        setIsChangingQuestion(false);
      }, 2000);
    } else {
      notifications.show({
        title: 'Connection Error',
        message: 'Not connected to the game server',
        color: 'red',
      });
      setIsChangingQuestion(false);
    }
  };

  const showEndQuizConfirmation = () => {
    modals.openConfirmModal({
      title: 'End Quiz?',
      children: (
        <Text size="sm">
          This was the last question. Do you want to end the quiz and view the
          final results?
        </Text>
      ),
      labels: { confirm: 'View Results', cancel: 'Stay Here' },
      confirmProps: { color: 'blue' },
      onConfirm: handleEndQuiz,
    });
  };

  const handleEndQuiz = () => {
    if (socketRef.current && isConnected) {
      // Show loading notification
      const loadingId = notifications.show({
        title: 'Ending Quiz',
        message: 'Processing quiz results...',
        color: 'blue',
        loading: true,
        autoClose: false,
      });

      // Emit endQuiz event
      socketRef.current?.emit('endQuiz', { code });
      setIsTimerRunning(false);
      setShowResults(true);

      // Note: The actual navigation will happen in the quizEnded event handler
      // This ensures we wait for the server to process everything before redirecting

      // Close the loading notification after a short delay
      setTimeout(() => {
        notifications.update({
          id: loadingId,
          title: 'Quiz Ended',
          message: 'The quiz has been ended for all participants',
          color: 'green',
          loading: false,
          autoClose: 2000,
        });
      }, 1000);
    } else {
      notifications.show({
        title: 'Connection Error',
        message: 'Not connected to the game server',
        color: 'red',
      });
    }
  };

  const handlePauseTimer = () => {
    if (socketRef.current && isConnected){
      if(isTimerRunning){
        const loadingId = notifications.show({
          title: 'Pausing Timer',
          message: 'Pausing timer...',
          color: 'blue',
          loading: true,
          autoClose: false,
        });
        socketRef.current.emit('pauseTimer', { code });
        setTimeout(() => {
          notifications.update({
            id: loadingId,
            title: 'Timer Paused',
            message: 'The timer has been paused',
            color: 'green',
            loading: false,
            autoClose: 2000,
          });
        }, 1000);
      }
      else{
        const loadingId = notifications.show({
          title: 'Resuming Timer',
          message: 'Resuming timer...',
          color: 'blue',
          loading: true,
          autoClose: false,
        });
        socketRef.current.emit('resumeTimer', { code });
        setTimeout(() => {
          notifications.update({
            id: loadingId,
            title: 'Timer Resumed',
            message: 'The timer has been resumed',
            color: 'green',
            loading: false,
            autoClose: 2000,
          });
        }, 1000);
      }
      
      setIsTimerRunning(!isTimerRunning);
    } else {
      notifications.show({
        title: 'Connection Error',
        message: 'Not connected to the game server',
        color: 'red',
      });
    }
  };

  const handleShowResults = () => {
    setShowResults(!showResults);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(0);
    setShowResults(true);

    socketRef.current?.emit('endQuestion', { code });
    notifications.show({
      title: 'Question Ended',
      message: 'The question has been ended, calculate the results',
      color: 'green',
    });
  };

  // Show loading state when data is loading or connection is being established
  if (isQuizLoading || isQuestionsLoading || !questions) {
    return (
      <Container size="xl" className={classes.container}>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            gap: '1rem',
          }}
        >
          <Loader size="xl" variant="dots" />
          <Text size="lg" fw={500} mt="md">
            Loading quiz data...
          </Text>
        </Box>
      </Container>
    );
  }

  // Show connection status when socket is not connected
  if (!isConnected) {
    return (
      <Container size="xl" className={classes.container}>
        <Paper
          p="xl"
          radius="lg"
          style={{ maxWidth: '500px', margin: '0 auto', marginTop: '10vh' }}
        >
          <Stack align="center" gap="xl">
            {connectionStatus === 'connecting' ||
            connectionStatus === 'reconnecting' ? (
              <>
                <Loader size="xl" color="blue" variant="dots" />
                <Title order={3}>
                  {connectionStatus === 'connecting'
                    ? 'Connecting to game server...'
                    : 'Reconnecting...'}
                </Title>
                <Text>Please wait while we establish a connection</Text>
                <Progress
                  value={100}
                  animated
                  size="lg"
                  radius="xl"
                  color="blue"
                  style={{ width: '100%' }}
                />
              </>
            ) : (
              <>
                <IconAlertCircle size={48} color={theme.colors.red[6]} />
                <Title order={3}>Connection Error</Title>
                <Text>
                  {connectionError || 'Failed to connect to the game server'}
                </Text>
                <Button
                  onClick={() => socketRef.current?.connect()}
                  leftSection={<IconArrowRight size={18} />}
                >
                  Reconnect
                </Button>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    );
  }

  const correctOptionIndex = currentQuestion?.correctOption;

  return (
    <Container className={classes.container}>
      {/* Header */}
      <Box className={classes.header}>
        <Group justify="space-between">
          <Group>
            <Badge size="lg" variant="filled" color="blue">
              Quiz: {quiz?.title}
            </Badge>
            <Badge size="lg" variant="outline">
              <Group gap={4}>
                <IconPodium size={16} />
                <Text size="sm">{participants.length} Participants</Text>
              </Group>
            </Badge>
          </Group>
          <Group>
            <Button
              variant="outline"
              color="blue"
              className={classes.controlButton}
              onClick={() => setShowLeaderboard(!showLeaderboard)}
            >
              {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
            </Button>
            <Button
              variant="outline"
              color="red"
              className={classes.controlButton}
              onClick={() => showEndQuizConfirmation()}
            >
              End Quiz
            </Button>
            <Button
              variant="filled"
              color={isTimerRunning ? 'orange' : 'green'}
              className={classes.controlButton}
              onClick={handlePauseTimer}
              leftSection={
                isTimerRunning ? (
                  <IconPlayerPause size={18} />
                ) : (
                  <IconPlayerSkipForward size={18} />
                )
              }
            >
              {isTimerRunning ? 'Pause' : 'Resume'}
            </Button>
            {!showResults && (
              <Button
                variant="filled"
                color="blue"
                className={classes.controlButton}
                onClick={handleShowResults}
                leftSection={<IconChartBar size={18} />}
              >
                Show Results
              </Button>
            )}
            {showResults && (
              <Button
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan' }}
                className={classes.controlButton}
                onClick={handleClickNextQuestion}
                loading={isChangingQuestion}
                leftSection={<IconPlayerSkipForward size={18} />}
              >
                Next Question
              </Button>
            )}
          </Group>
        </Group>

        <Group justify="center" mt="md">
          <Text className={classes.questionCounter}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </Group>

        {/* Progress Bar for Responses */}
        <Box mt="md">
          <Group justify="space-between" mb={5}>
            <Text className={classes.progressLabel}>Responses</Text>
            <Text className={classes.progressLabel}>
              {responseCount} / {participants.length}
            </Text>
          </Group>
          <Progress
            value={(responseCount / participants.length) * 100}
            color="green"
            radius="xl"
            size="lg"
          />
          <Text size="xs" ta="center" mt={5}>
            {Math.round((responseCount / participants.length) * 100)}% responded
          </Text>
        </Box>
      </Box>

      {/* Timer Display */}
      <Group justify="space-between" style={{ width: '100%' }}>
        <Box className={classes.timerContainer}>
          <RingProgress
            size={120}
            thickness={12}
            roundCaps
            sections={[
              {
                value:
                  (timeRemaining / (currentQuestion?.timeLimit || 30)) * 100,
                color:
                  timeRemaining > (currentQuestion?.timeLimit || 30) * 0.33
                    ? 'green'
                    : 'orange',
              },
            ]}
            label={
              <Group justify="center">
                <IconClock size={24} stroke={1.5} />
                <Text className={classes.timer}>{timeRemaining}</Text>
              </Group>
            }
          />
        </Box>

        {/* Live Leaderboard */}
        {showLeaderboard && (
          <Box style={{ flex: 1 }}>
            <LiveLeaderboard
              participants={participants}
              totalQuestions={questions?.length || 0}
              currentQuestion={currentQuestionIndex}
              recentJoins={recentJoins}
              recentLeaves={recentLeaves}
            />
          </Box>
        )}
      </Group>

      {/* Question Display */}
      <Card className={classes.questionCard}>
        <Text className={classes.questionText}>{currentQuestion?.text}</Text>
      </Card>

      {/* Answer Options - 2x2 Grid */}
      <SimpleGrid cols={2} spacing="xl">
        {currentQuestion?.options.map((option, index) => (
          <Paper
            key={index}
            className={classes.answerOption}
            style={{
              backgroundColor: theme.colors[ANSWER_COLORS[index]][6],
              opacity: showResults
                ? index === correctOptionIndex
                  ? 1
                  : 0.7
                : 1,
              border:
                showResults && index === correctOptionIndex
                  ? `4px solid ${theme.colors.green[5]}`
                  : 'none',
            }}
          >
            <Text className={classes.answerText}>{option.text}</Text>

            {/* Show percentage of responses when results are shown */}
            <Badge
              size="xl"
              color={index === correctOptionIndex ? 'green' : 'gray'}
              variant="filled"
              mt="md"
            >
              {answers[index] || 0} responses (
              {Math.round(((answers[index] || 0) / participants.length) * 100)}
              %)
            </Badge>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Footer */}
      <Box className={classes.footer}>
        <Group justify="space-between">
          <Text>Admin view - Participants can't see your controls</Text>
          <Group>
            <Button
              variant="filled"
              color="blue"
              className={classes.controlButton}
              onClick={handleShowResults}
              leftSection={<IconChartBar size={18} />}
            >
              {showResults ? 'Hide Results' : 'Show Results'}
            </Button>

            <Button
              variant="filled"
              color="blue"
              className={classes.controlButton}
              onClick={handleClickNextQuestion}
              leftSection={<IconPlayerSkipForward size={18} />}
            >
              Next Question
            </Button>

            <Button
              variant="filled"
              color="red"
              className={classes.controlButton}
              onClick={handleStopTimer}
              leftSection={<IconPlayerPause size={18} />}
            >
              End the current question
            </Button>
          </Group>
        </Group>
      </Box>
    </Container>
  );
};

export default QuizActiveGamePage;
