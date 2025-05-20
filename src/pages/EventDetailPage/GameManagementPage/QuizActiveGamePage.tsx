import React, { useState, useEffect } from 'react';
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
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useGetQuizById, useGetQuizQuestions } from '@/queries/useQuizQueries';
import { createStyles } from '@mantine/styles';
import { modals } from '@mantine/modals';
import { useSocket } from '@/contexts/SocketContext';

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
  const { eventId, showId, quizId } = useParams<{
    eventId: string;
    showId: string;
    quizId: string;
  }>();
  const { code } = useSearchParams();
  const navigate = useNavigate();
  const { socket, isConnected, connect, currentCode } = useSocket();
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(60); // Default 30 seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [responseCount, setResponseCount] = useState<number>(0); // Number of participants who responded
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isChangingQuestion, setIsChangingQuestion] = useState<boolean>(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});

  // Fetch quiz data
  const { data: quiz, isLoading: isQuizLoading } = useGetQuizById(
    Number(showId),
    Number(quizId),
  );

  const { data: questions, isLoading: isQuestionsLoading } =
    useGetQuizQuestions(Number(eventId), Number(quizId));

  // Connect to WebSocket
  useEffect(() => {
    // Connect to socket only if not already connected to the same code
    if (!socket || currentCode !== code) {
      console.log('Connecting to socket for quiz code:', code);
      connect(code);
    } else {
      console.log('Reusing existing socket connection for quiz code:', code);
    }

    socket?.on('joinedQuiz', (data) => {
      console.log('Host joined quiz:', data);
      if (data.activeUsers && Array.isArray(data.activeUsers)) {
        setParticipants(data.activeUsers);
      }
    });

    socket?.on('participantJoined', (data) => {
      console.log('Participant joined:', data);
      setParticipants((prevParticipants) => {
        if (!prevParticipants.some((p) => p.userId === data.userId)) {
          return [
            ...prevParticipants,
            {
              userId: data.userId,
              username: data.username,
              joinTime: new Date(),
            },
          ];
        }
        return prevParticipants;
      });

      notifications.show({
        title: 'New Player',
        message: `${data.username} has joined the game`,
        color: 'blue',
      });
    });

    socket?.on('participantLeft', (data) => {
      console.log('Participant left:', data);
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));

      notifications.show({
        title: 'Player Left',
        message: `${data.username} has left the game`,
        color: 'gray',
      });
    });

    socket?.on('answerSubmitted', (data) => {
      // Update response count
      setResponseCount((prev) => prev + 1);

      // Update answer distribution
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        const option = data.selectedOption;
        newAnswers[option] = (newAnswers[option] || 0) + 1;
        return newAnswers;
      });
    });

    socket?.on('leaderboardUpdated', (data) => {
      console.log('Leaderboard updated:', data);
    });

    socket?.on('error', (error) => {
      console.error('Socket error:', error);
      notifications.show({
        title: 'Connection Error',
        message: 'Failed to connect to the game server',
        color: 'red',
      });
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('joinedQuiz');
        socket.off('participantJoined');
        socket.off('participantLeft');
        socket.off('answerSubmitted');
        socket.off('leaderboardUpdated');
        socket.off('error');
        socket.close();
      }
    };
  }, [code, navigate, socket, connect]);

  // Timer effect
  useEffect(() => {
    let timerId: number | undefined;

    if (isTimerRunning && timeRemaining > 0) {
      timerId = window.setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            // Timer reached 0, stop and show results
            setIsTimerRunning(false);
            setShowResults(true);
            return 0;
          }
          return prevTime - 1;
        });

        // Simulate incoming responses
        if (Math.random() > 0.5 && responseCount < participants.length) {
          setResponseCount((prev) => Math.min(prev + 1, participants.length));
        }
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isTimerRunning, timeRemaining, responseCount, participants.length]);

  const handleNextQuestion = () => {
    // Check if this is the last question
    // if (questions && currentQuestionIndex >= questions.length - 1) {
    //   showEndQuizConfirmation();
    //   return;
    // }
    // setIsChangingQuestion(true);
    // // Use WebSocket to notify all clients about the next question
    // if (socket) {
    //   socket.emit('nextQuestion', { code: joinCode });
    //   setCurrentQuestionIndex((prev) => prev + 1);
    //   setShowResults(false);
    //   setTimeRemaining(30);
    //   setIsTimerRunning(true);
    //   setResponseCount(0);
    //   setAnswers({});
    //   setIsChangingQuestion(false);
    // } else {
    //   // Fallback to API if socket is not available
    //   nextQuestionMutation.mutate();
    // }
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
    if (socket) {
      socket.emit('endQuiz', { code: code });
      notifications.show({
        title: 'Quiz Ended',
        message: 'The quiz has been ended for all participants',
        color: 'blue',
      });
      navigate(
        `/events/${eventId}/shows/${showId}/game-management/${quizId}/results`,
      );
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleShowResults = () => {
    setIsTimerRunning(false);
    setShowResults(true);
  };

  if (isQuizLoading || isQuestionsLoading || !questions) {
    return (
      <Container size="xl" className={classes.container}>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
          }}
        >
          <Loader size="xl" variant="dots" />
        </Box>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
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
                onClick={handleNextQuestion}
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
      <Box className={classes.timerContainer}>
        <RingProgress
          size={120}
          thickness={12}
          roundCaps
          sections={[
            {
              value: (timeRemaining / 30) * 100,
              color: timeRemaining > 10 ? 'green' : 'orange',
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
            {showResults && (
              <Badge
                size="xl"
                color={index === correctOptionIndex ? 'green' : 'gray'}
                variant="filled"
                mt="md"
              >
                {answers[index] || 0} responses (
                {Math.round(
                  ((answers[index] || 0) / participants.length) * 100,
                )}
                %)
              </Badge>
            )}
          </Paper>
        ))}
      </SimpleGrid>

      {/* Footer */}
      <Box className={classes.footer}>
        <Group justify="space-between">
          <Text>Admin view - Participants can't see your controls</Text>
          <Group>
            {showResults ? (
              <Button
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan' }}
                className={classes.controlButton}
                onClick={handleNextQuestion}
                loading={isChangingQuestion}
                leftSection={<IconPlayerSkipForward size={18} />}
              >
                Next Question
              </Button>
            ) : (
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
          </Group>
        </Group>
      </Box>
    </Container>
  );
};

export default QuizActiveGamePage;
