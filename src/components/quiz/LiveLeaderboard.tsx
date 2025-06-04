import { useState, useEffect } from 'react';
import {
  Table,
  Group,
  Text,
  Avatar,
  Badge,
  Progress,
  useMantineTheme,
  Box,
  Title,
  Stack,
  ScrollArea,
  Card,
} from '@mantine/core';
import { IconTrophy, IconCrown, IconMedal, IconUserPlus, IconUserMinus } from '@tabler/icons-react';
import { createStyles } from '@mantine/styles';

interface Participant {
  userId: string;
  username?: string;
  score: number;
  questionsAnswered: number;
  lastActive: number;
}

interface LiveLeaderboardProps {
  participants: Participant[];
  totalQuestions: number;
  currentQuestion: number;
  recentJoins?: string[];
  recentLeaves?: string[];
}

// Create styles
const useStyles = createStyles((theme) => ({
  container: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.white,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.sm,
  },
  title: {
    marginBottom: theme.spacing.md,
    fontWeight: 600,
  },
  avatarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statCard: {
    backgroundColor: theme.colors.blue[0],
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  activityFeed: {
    marginTop: theme.spacing.md,
    maxHeight: '150px',
    overflow: 'auto',
  },
  activityItem: {
    padding: theme.spacing.xs,
    backgroundColor: theme.white,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
    boxShadow: theme.shadows.xs,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  join: {
    color: theme.colors.green[6],
  },
  leave: {
    color: theme.colors.red[6],
  },
}));

export function LiveLeaderboard({
  participants,
  totalQuestions,
  currentQuestion,
  recentJoins = [],
  recentLeaves = [],
}: LiveLeaderboardProps) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [sortedParticipants, setSortedParticipants] = useState<Participant[]>([]);

  // Sort participants by score (descending)
  useEffect(() => {
    const sorted = [...participants].sort((a, b) => b.score - a.score);
    setSortedParticipants(sorted);
  }, [participants]);

  // Get rank-specific colors and icons
  const getRankElement = (rank: number) => {
    if (rank === 0) {
      return {
        icon: <IconCrown size={22} color={theme.colors.yellow[5]} />,
        color: 'yellow',
      };
    } else if (rank === 1) {
      return {
        icon: <IconMedal size={22} color={theme.colors.gray[3]} />,
        color: 'gray',
      };
    } else if (rank === 2) {
      return {
        icon: <IconMedal size={22} color={theme.colors.orange[5]} />,
        color: 'orange',
      };
    } else {
      return {
        icon: <Text size="sm" fw={700}>{rank + 1}</Text>,
        color: 'blue',
      };
    }
  };

  return (
    <div className={classes.container}>
      <Group justify="space-between" p="md">
        <Title order={3} className={classes.title}>Live Leaderboard</Title>
        <Badge size="lg" color="blue" variant="filled">
          {participants.length} Players
        </Badge>
      </Group>

      <Group justify="space-between" px="md" pb="md">
        <Card className={classes.statCard} p="xs">
          <Text size="xs" color="dimmed">Current Question</Text>
          <Text size="lg" fw={700}>{currentQuestion + 1} / {totalQuestions}</Text>
        </Card>
        
        <Card className={classes.statCard} p="xs">
          <Text size="xs" color="dimmed">Participation Rate</Text>
          <Progress 
            value={(participants.reduce((acc, p) => acc + (p.questionsAnswered > currentQuestion ? 1 : 0), 0) / Math.max(1, participants.length)) * 100} 
            color="green"
            size="sm"
            mt={5}
          />
        </Card>

        <Card className={classes.statCard} p="xs">
          <Text size="xs" color="dimmed">Avg. Score</Text>
          <Text size="lg" fw={700}>
            {participants.length ? Math.round(participants.reduce((acc, p) => acc + p.score, 0) / participants.length) : 0}
          </Text>
        </Card>
      </Group>

      <ScrollArea h={250} px="md" pb="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Rank</Table.Th>
              <Table.Th>Player</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Progress</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Score</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedParticipants.map((participant, index) => {
              const rankElement = getRankElement(index);
              const progress = (participant.questionsAnswered / totalQuestions) * 100;

              return (
                <Table.Tr key={participant.userId}>
                  <Table.Td>
                    <Badge
                      color={rankElement.color}
                      radius="sm"
                      p="xs"
                      style={{ minWidth: '36px' }}
                    >
                      <Group gap={4} justify="center">
                        {rankElement.icon}
                      </Group>
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <div className={classes.avatarContainer}>
                      <Avatar
                        radius="xl"
                        color={theme.colors[
                          ['blue', 'green', 'cyan', 'teal', 'indigo', 'violet'][
                            index % 6
                          ]
                        ][6]}
                      >
                        {(participant?.username || 'User').substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Text fw={500} lineClamp={1}>
                        {participant?.username || `Player ${(participant?.userId || 'user').substring(0, 4)}`}
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td align="center">
                    <Box style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Progress
                        value={progress}
                        color={
                          progress >= 100
                            ? 'green'
                            : progress > 50
                            ? 'blue'
                            : 'orange'
                        }
                        size="sm"
                        style={{ width: '100px' }}
                      />
                      <Text size="xs" ml={5}>
                        {participant.questionsAnswered}/{totalQuestions}
                      </Text>
                    </Box>
                  </Table.Td>
                  <Table.Td align="right">
                    <Group gap={4} justify="flex-end">
                      <IconTrophy size={16} color={theme.colors.yellow[6]} />
                      <Text fw={700} size="lg">
                        {participant.score}
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Player activity feed */}
      {(recentJoins.length > 0 || recentLeaves.length > 0) && (
        <Box p="md" className={classes.activityFeed}>
          <Text fw={600} mb={10}>Recent Activity</Text>
          <Stack gap="xs">
            {recentJoins.map((username, i) => (
              <div key={`join-${i}`} className={classes.activityItem}>
                <IconUserPlus size={16} className={classes.join} />
                <Text size="sm"><b>{username}</b> joined the game</Text>
              </div>
            ))}
            {recentLeaves.map((username, i) => (
              <div key={`leave-${i}`} className={classes.activityItem}>
                <IconUserMinus size={16} className={classes.leave} />
                <Text size="sm"><b>{username}</b> left the game</Text>
              </div>
            ))}
          </Stack>
        </Box>
      )}
    </div>
  );
}
