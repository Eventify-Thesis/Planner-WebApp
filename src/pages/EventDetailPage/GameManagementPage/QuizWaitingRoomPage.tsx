import React, { useState, useEffect, useRef } from 'react';
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
  Paper,
  Box,
  CopyButton,
  Tooltip,
  Avatar,
  useMantineTheme,
  Divider,
  List,
  Grid,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconPlayerPlay,
  IconUsers,
  IconCheck,
  IconCopy,
  IconUserPlus,
  IconBrandDiscord,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useGetQuizById } from '@/queries/useQuizQueries';
import { createStyles } from '@mantine/styles';
import { useGetJoinCode } from '@/queries/useGetJoinCode';
import { io, Socket } from 'socket.io-client';

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
  },
  header: {
    backgroundImage: `linear-gradient(135deg, ${theme.colors.violet[6]} 0%, ${theme.colors.indigo[5]} 100%)`,
    color: theme.white,
    padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
    borderTopLeftRadius: theme.radius.md,
    borderTopRightRadius: theme.radius.md,
  },
  codeDisplay: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[5]
        : theme.colors.gray[0],
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: '0.5rem',
    position: 'relative',
    fontFamily: 'monospace',
  },
  participant: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
  },
  button: {
    transition: 'transform 0.2s ease',
    '&:active': {
      transform: 'scale(0.95)',
    },
  },
  startButton: {
    backgroundImage: `linear-gradient(135deg, ${theme.colors.green[6]} 0%, ${theme.colors.teal[6]} 100%)`,
    fontSize: theme.fontSizes.md,
    fontWeight: 600,
  },
}));

export const QuizWaitingRoomPage: React.FC = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const { eventId, showId, quizId } = useParams<{
    eventId: string;
    showId: string;
    quizId: string;
  }>();

  const navigate = useNavigate();

  // State for game session
  const [participants, setParticipants] = useState<any[]>([]);

  // Fetch quiz data
  const { data: quiz, isLoading: isQuizLoading } = useGetQuizById(
    Number(showId),
    Number(quizId),
  );

  const { data: joinCodeData, isLoading: isJoinCodeLoading } = useGetJoinCode(
    Number(eventId),
    Number(quizId),
  );

  const joinCode = joinCodeData?.code;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!joinCode) return;

    socketRef.current = io(`${import.meta.env.VITE_API_BASE_URL}/quiz`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      auth: {
        code: joinCode,
        userId: 'host-user',
        username: 'Quiz Host',
        isHost: true,
      },
    });

    const handleConnect = () => {
      setIsConnected(true);
      socketRef.current?.emit('joinQuizByCode', {
        code: joinCode,
        userId: 'host-user',
        username: 'Quiz Host',
        isHost: true,
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleParticipantJoined = (data: any) => {
      if (data.userId === 'host-user') return;
      setParticipants((prev) => [...prev, data]);
    };

    socketRef.current?.on('connect', handleConnect);
    socketRef.current?.on('disconnect', handleDisconnect);
    socketRef.current?.on('participantJoined', handleParticipantJoined);

    return () => {
      socketRef.current?.off('connect', handleConnect);
      socketRef.current?.off('disconnect', handleDisconnect);
      socketRef.current?.off('participantJoined', handleParticipantJoined);
    };
  }, [joinCode]);

  const handleStartGame = async () => {
    if (participants.length < 1) {
      notifications.show({
        title: 'No participants',
        message: 'Wait for participants to join before starting the game.',
        color: 'yellow',
      });
      return;
    }

    if (!socketRef.current || !isConnected) {
      socketRef.current?.connect();
    }

    console.log('Starting game...', {
      socket: socketRef.current,
      isConnected,
      joinCode,
    });

    setTimeout(() => {
      socketRef.current?.emit('startQuiz', {
        code: joinCode,
      });
    }, 1000);

    navigate(
      `/events/${eventId}/shows/${showId}/game-management/${quizId}/active/${joinCode}`,
    );
  };

  const handleCopyCode = () => {
    notifications.show({
      title: 'Code copied!',
      message: 'Game code copied to clipboard.',
      color: 'blue',
    });
  };

  if (isQuizLoading || isJoinCodeLoading) {
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
          className={`${classes.button} ${classes.startButton}`}
          disabled={participants.length === 0}
          onClick={handleStartGame}
        >
          Start Game Now
        </Button>
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card shadow="md" radius="lg" className={classes.card} mb="xl">
            <Box className={classes.header}>
              <Group justify="space-between">
                <Title order={3}>Game Join Code</Title>
                <IconBrandDiscord size={24} />
              </Group>
            </Box>
            <Stack p="xl" gap="md">
              <Text>
                Share this code with participants so they can join the game:
              </Text>

              <Paper className={classes.codeDisplay}>
                {isJoinCodeLoading ? (
                  <Loader size="md" color="indigo" variant="dots" />
                ) : (
                  joinCode
                )}
                <Group
                  justify="flex-end"
                  style={{ position: 'absolute', top: '8px', right: '8px' }}
                >
                  <CopyButton value={joinCode} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? 'Copied' : 'Copy'}
                        withArrow
                        position="right"
                      >
                        <ActionIcon
                          color={copied ? 'teal' : 'gray'}
                          onClick={() => {
                            copy();
                            handleCopyCode();
                          }}
                        >
                          {copied ? (
                            <IconCheck size={16} />
                          ) : (
                            <IconCopy size={16} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Paper>

              <Text size="sm" c="dimmed">
                Participants can join by going to the quiz app and entering this
                code
              </Text>

              <Divider my="sm" label="OR" labelPosition="center" />

              <Button
                variant="outline"
                leftSection={<IconUserPlus size={16} />}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Join my quiz! Enter code: ${joinCode} at https://quizapp.example.com/join`,
                  );
                  notifications.show({
                    title: 'Invite copied!',
                    message:
                      'Invite link copied to clipboard. Share it with participants.',
                    color: 'teal',
                  });
                }}
              >
                Copy Invite Link
              </Button>
            </Stack>
          </Card>

          <Card shadow="md" radius="lg" className={classes.card}>
            <Box className={classes.header}>
              <Group justify="space-between">
                <Title order={3}>How It Works</Title>
              </Group>
            </Box>
            <Stack p="xl" gap="md">
              <List spacing="xs" size="sm">
                <List.Item>
                  Share the code with participants so they can join
                </List.Item>
                <List.Item>
                  Wait for participants to join (they'll appear in the list)
                </List.Item>
                <List.Item>
                  Click "Start Game Now" when everyone has joined
                </List.Item>
                <List.Item>
                  Questions will be displayed on participants' devices
                </List.Item>
                <List.Item>
                  You'll see live results as participants answer
                </List.Item>
              </List>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card
            shadow="md"
            radius="lg"
            className={classes.card}
            style={{ height: '100%' }}
          >
            <Box className={classes.header}>
              <Group justify="space-between">
                <Title order={3}>Participants</Title>
                <IconUsers size={24} />
              </Group>
            </Box>

            {participants.length === 0 ? (
              <Box className={classes.emptyState}>
                <IconUserPlus size={48} opacity={0.5} />
                <Text mt="md" size="lg" fw={500}>
                  Waiting for participants...
                </Text>
                <Text mt="xs" c="dimmed" size="sm">
                  Share the game code with your participants
                </Text>
              </Box>
            ) : (
              <Stack p="xl" gap="md">
                <Group justify="space-between">
                  <Badge size="lg" radius="md">
                    {participants.length} Joined
                  </Badge>
                  {participants.length >= 2 && (
                    <Text size="sm" c="dimmed">
                      Ready to start!
                    </Text>
                  )}
                </Group>

                <Stack gap="xs">
                  {participants &&
                    participants.length > 0 &&
                    participants.map((participant) => (
                      <Paper
                        key={participant.userId}
                        className={classes.participant}
                      >
                        <Group>
                          <Avatar
                            color={theme.colors[theme.primaryColor][5]}
                            radius="xl"
                          >
                            {participant.username.charAt(0)}
                          </Avatar>
                          <Box>
                            <Text fw={500}>{participant.username}</Text>
                            <Text size="xs" c="dimmed">
                              Joined just now
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    ))}
                </Stack>
              </Stack>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default QuizWaitingRoomPage;
