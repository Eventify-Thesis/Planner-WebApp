import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Group,
  Text,
  Card,
  ActionIcon,
  Loader,
  Stack,
  Badge,
  Center,
  RingProgress,
  Box,
  useMantineTheme,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconPlayerPlay,
  IconConfetti,
  IconQuestionMark,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useGetQuizById, useGetQuizQuestions } from '@/queries/useQuizQueries';
import { createStyles } from '@mantine/styles';

// Modern teen-friendly styles
const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    boxShadow: theme.shadows.md,
  },
  card: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },
  header: {
    backgroundImage: `linear-gradient(135deg, ${theme.colors.violet[6]} 0%, ${theme.colors.indigo[5]} 100%)`,
    color: theme.white,
    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
  },
  button: {
    transition: 'transform 0.2s ease',
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
}));

export const QuizPlayPage: React.FC = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const { eventId, showId, quizId } = useParams<{
    eventId: string;
    showId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();

  // Fetch quiz data
  const { data: quiz, isLoading: isQuizLoading } = useGetQuizById(
    Number(showId),
    Number(quizId),
  );

  // Fetch quiz questions
  const { data: questions, isLoading: isQuestionsLoading } =
    useGetQuizQuestions(Number(showId), Number(quizId));

  const handleStartQuiz = () => {
    // Redirect to the actual quiz play page with game setup
    navigate(
      `/events/${eventId}/shows/${showId}/game-management/${quizId}/play/waiting-room`,
    );
  };

  if (isQuizLoading || isQuestionsLoading) {
    return (
      <Center h="100vh">
        <Loader size="xl" variant="dots" />
      </Center>
    );
  }

  return (
    <Container size="xl" className={classes.container}>
      <Group justify="space-between" mb="xl">
        <Group>
          <ActionIcon
            variant="light"
            color="blue"
            radius="xl"
            size="lg"
            onClick={() =>
              navigate(
                `/events/${eventId}/shows/${showId}/game-management/${quizId}`,
              )
            }
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={2}>{quiz?.title || 'Quiz'}</Title>
        </Group>
        <Button
          size="md"
          radius="md"
          leftSection={<IconPlayerPlay size={16} />}
          className={classes.button}
          gradient={{ from: 'indigo', to: 'cyan' }}
          variant="gradient"
          onClick={handleStartQuiz}
        >
          Start Quiz
        </Button>
      </Group>

      <Card shadow="md" radius="lg" className={classes.card} mb="xl">
        <Box className={classes.header}>
          <Group justify="space-between">
            <Title order={3}>Quiz Configuration</Title>
            <IconConfetti size={24} />
          </Group>
        </Box>
        <Stack p="xl" gap="md">
          <Group justify="center">
            <RingProgress
              size={120}
              roundCaps
              thickness={8}
              sections={[{ value: 100, color: theme.colors.blue[6] }]}
              label={
                <Center>
                  <IconQuestionMark size="2rem" stroke={1.5} />
                </Center>
              }
            />
          </Group>

          <Group justify="center" mt="md">
            <Badge size="lg" radius="md">
              {questions?.length || 0} Questions
            </Badge>
            <Badge size="lg" radius="md" color="green">
              Passing: {quiz?.passingScore}%
            </Badge>
            {quiz?.timeLimit && (
              <Badge size="lg" radius="md" color="blue">
                Time Limit: {quiz.timeLimit} min
              </Badge>
            )}
          </Group>

          <Text c="dimmed" ta="center" mt="sm">
            Click "Start Quiz" to begin. Once started, participants will be able
            to join with a generated code.
          </Text>
        </Stack>
      </Card>

      <Card shadow="md" radius="lg" className={classes.card}>
        <Box className={classes.header}>
          <Group justify="space-between">
            <Title order={3}>Instructions</Title>
          </Group>
        </Box>
        <Stack p="xl" gap="md">
          <Text>
            1. Click the "Start Quiz" button to proceed to the game screen.
          </Text>
          <Text>
            2. On the next screen, you'll receive a unique join code to share
            with participants.
          </Text>
          <Text>
            3. Once participants have joined, you can begin the quiz session.
          </Text>
          <Text>
            4. You'll be able to control the pace of the quiz by moving through
            questions manually.
          </Text>
        </Stack>
      </Card>
    </Container>
  );
};

export default QuizPlayPage;
