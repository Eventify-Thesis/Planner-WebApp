import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Title,
  Box,
  Stack,
  Skeleton,
  Button,
  Text,
  Paper,
  Center,
} from '@mantine/core';
import { IconLayoutKanban } from '@tabler/icons-react';
import { SimpleDndBoard } from './components/SimpleDndBoard';
import { KanbanProvider, useKanban } from './context/KanbanContext';

// Create a container component that uses the KanbanContext
const KanbanBoardContent: React.FC = () => {
  const { 
    isLoading, 
    hasError, 
    boardExists, 
    createBoard 
  } = useKanban();
  
  if (hasError) {
    return (
      <Box p="md">
        <Title order={2} mb="md">
          Kanban Board
        </Title>
        <div>Error loading kanban board data. Please try again later.</div>
      </Box>
    );
  }

  return (
    <Box p="md">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <Title order={2}>Kanban Board</Title>
        {!isLoading && !boardExists && (
          <Button
            onClick={createBoard}
            leftSection={<IconLayoutKanban size={16} />}
          >
            Create Kanban Board
          </Button>
        )}
      </div>

      {isLoading ? (
        <Stack>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexGrow: 1,
              flexWrap: 'nowrap',
              overflowX: 'auto',
            }}
          >
            {[1, 2, 3].map((i) => (
              <Box key={i} w={280} miw={280}>
                <Skeleton height={40} mb="md" />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} height={80} />
                  ))}
                </div>
              </Box>
            ))}
          </div>
        </Stack>
      ) : !boardExists ? (
        <Paper p="xl" withBorder>
          <Center style={{ minHeight: 300 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <IconLayoutKanban size={48} stroke={1.5} />
              <Text size="lg" fw={500}>
                No Kanban board found for this event
              </Text>
              <Text c="dimmed" size="sm" ta="center">
                Create a Kanban board to manage tasks and track progress for
                this event
              </Text>
              <Button
                onClick={createBoard}
                mt="md"
              >
                Create Kanban Board
              </Button>
            </div>
          </Center>
        </Paper>
      ) : (
        <SimpleDndBoard />
      )}
    </Box>
  );
};

// Main component that provides the context
const KanbanBoardPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <KanbanProvider eventId={eventId || '0'}>
      <KanbanBoardContent />
    </KanbanProvider>
  );
};

export default KanbanBoardPage;
