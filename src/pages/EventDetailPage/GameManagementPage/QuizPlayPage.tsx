import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Group,
  Text,
  Card,
  ActionIcon,
  Modal,
  Loader,
  Stack,
  Paper,
  Center,
  Image,
  Box,
  Divider,
  Badge,
  Progress,
} from '@mantine/core';
import { IconArrowLeft, IconPlayerPlay, IconQrcode } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useGetQuizById, useGetQuizQuestions } from '@/queries/useQuizQueries';
import { useStartNextQuestion } from '@/mutations/useQuizMutations';

export const QuizPlayPage: React.FC = () => {
  const { eventId, showId, quizId } = useParams<{
    eventId: string;
    showId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();
  const [joinModalOpened, { open: openJoinModal, close: closeJoinModal }] =
    useDisclosure(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  // Create a join URL directly from the quiz ID
  const joinUrl = `${window.location.origin}/join/${quizId}`;

  // Fetch quiz data
  const { data: quiz, isLoading: isQuizLoading } = useGetQuizById(
    Number(showId),
    Number(quizId),
  );

  // Fetch quiz questions
  const { data: questions, isLoading: isQuestionsLoading } =
    useGetQuizQuestions(Number(showId), Number(quizId));

  // Mutations
  const startNextQuestionMutation = useStartNextQuestion(
    Number(showId),
    Number(quizId),
  );

  const handleShowQRCode = () => {
    openJoinModal();
  };

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = async () => {
    if (questions && currentQuestionIndex !== null) {
      if (currentQuestionIndex < questions.length - 1) {
        try {
          await startNextQuestionMutation.mutateAsync();
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to start next question',
            color: 'red',
          });
        }
      } else {
        // End of quiz
        notifications.show({
          title: 'Quiz Completed',
          message: 'All questions have been shown',
          color: 'green',
        });
      }
    }
  };

  if (isQuizLoading || isQuestionsLoading) {
    return <Loader />;
  }

  const currentQuestion =
    currentQuestionIndex !== null && questions
      ? questions[currentQuestionIndex]
      : null;

  return (
    <Container size="xl" p="md">
      <Group justify="space-between" mb="md">
        <Group>
          <ActionIcon
            variant="subtle"
            onClick={() =>
              navigate(
                `/events/${eventId}/shows/${showId}/game-management/${quizId}`,
              )
            }
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{quiz?.title} - Play Mode</Title>
        </Group>
        <Group>
          <Button
            leftSection={<IconQrcode size={16} />}
            onClick={handleShowQRCode}
            variant="outline"
          >
            Show QR Code
          </Button>
          {currentQuestionIndex === null ? (
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              onClick={handleStartQuiz}
              color="green"
            >
              Start Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={
                !questions || currentQuestionIndex >= questions.length - 1
              }
            >
              Next Question
            </Button>
          )}
        </Group>
      </Group>

      {currentQuestionIndex === null ? (
        <Card withBorder shadow="sm" p="xl" ta="center">
          <IconPlayerPlay
            size={48}
            stroke={1.5}
            color="var(--mantine-color-blue-6)"
          />
          <Title order={3} mt="md">
            Ready to Start Quiz
          </Title>
          <Text c="dimmed" mt="sm">
            Click the "Start Quiz" button to begin. Make sure all participants
            have joined.
          </Text>
          <Group justify="center" mt="xl">
            <Badge size="lg">{questions?.length || 0} Questions</Badge>
            <Badge size="lg" color="green">
              Passing Score: {quiz?.passingScore}%
            </Badge>
          </Group>
        </Card>
      ) : (
        <Stack>
          <Progress
            value={
              ((currentQuestionIndex + 1) / (questions?.length || 1)) * 100
            }
            size="sm"
            mb="md"
          />

          <Group justify="space-between" mb="xs">
            <Text size="sm">
              Question {currentQuestionIndex + 1} of {questions?.length}
            </Text>
            {currentQuestion?.timeLimit && (
              <Badge color="blue">
                Time: {currentQuestion.timeLimit} seconds
              </Badge>
            )}
          </Group>

          <Card withBorder shadow="sm" p="lg" mb="md">
            <Title order={3} mb="xl">
              {currentQuestion?.text}
            </Title>

            <Stack gap="md">
              {currentQuestion?.options.map((option, index) => (
                <Paper key={index} p="md" withBorder shadow="sm">
                  <Group>
                    <Text fw={600} size="lg">
                      {index + 1}.
                    </Text>
                    <Text size="lg">{option}</Text>
                  </Group>
                </Paper>
              ))}
            </Stack>

            <Divider my="xl" />

            <Group justify="space-between">
              <Text c="dimmed">
                Correct Answer: Option{' '}
                {(currentQuestion?.correctOption || 0) + 1}
              </Text>
              <Text c="dimmed">
                {currentQuestionIndex + 1} / {questions?.length}
              </Text>
            </Group>
          </Card>
        </Stack>
      )}

      {/* Join Modal with QR Code */}
      <Modal
        opened={joinModalOpened}
        onClose={closeJoinModal}
        title="Join Quiz"
        size="md"
        centered
      >
        <Stack align="center">
          <Text ta="center" mb="md">
            Participants can join the quiz by scanning this QR code or using the
            link below:
          </Text>

          <Box mb="md">
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                joinUrl,
              )}`}
              alt="QR Code"
              width={200}
              height={200}
              mx="auto"
            />
          </Box>

          <Paper withBorder p="sm" w="100%">
            <Text ta="center" fw={500}>
              {joinUrl}
            </Text>
          </Paper>

          <Button onClick={closeJoinModal} mt="md">
            Close
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
};

export default QuizPlayPage;
