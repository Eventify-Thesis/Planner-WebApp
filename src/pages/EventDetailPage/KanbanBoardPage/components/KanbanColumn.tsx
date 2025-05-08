import React from 'react';
import {
  Paper,
  Text,
  Button,
  TextInput,
  ActionIcon,
  Badge,
  Divider,
  Stack,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
// No longer using useDroppable directly in this component
import { IconPlus, IconDotsVertical } from '@tabler/icons-react';

import {
  KanbanColumn as IKanbanColumn,
  KanbanTask as IKanbanTask,
  TaskAssignment,
} from '@/api/kanban.client';
import { KanbanTask } from './KanbanTask';
import { useCreateKanbanTask } from '@/mutations/useCreateKanbanTask';
import { useParams } from 'react-router-dom';

interface KanbanColumnProps {
  id: string;
  column: IKanbanColumn;
  tasks: IKanbanTask[];
  activeTaskId: string | null;
  getAssignments: (taskId: number) => TaskAssignment[];
  onEditTask: (task: IKanbanTask) => void;
  style?: React.CSSProperties;
  isOver?: boolean; // Add isOver prop to show visual feedback during drag
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  // id param no longer used since we're not using useDroppable directly
  column,
  tasks,
  activeTaskId,
  getAssignments,
  onEditTask,
  style,
  isOver = false, // Default value if not provided
}) => {
  const { eventId } = useParams();

  // Now using isOver directly as a prop, no need for useDroppable or setNodeRef
  const [isAddingTask, { open: openAddTask, close: closeAddTask }] =
    useDisclosure(false);
  const createTask = useCreateKanbanTask(eventId);

  const form = useForm({
    initialValues: {
      title: '',
    },
    validate: {
      title: (value) =>
        value.trim().length === 0 ? 'Title is required' : null,
    },
  });

  const handleAddTask = (values: { title: string }) => {
    const newPosition =
      tasks.length > 0
        ? Math.max(...tasks.map((task) => task.position)) + 1
        : 0;

    createTask.mutate(
      {
        columnId: column.id,
        title: values.title,
        position: newPosition,
      },
      {
        onSuccess: () => {
          form.reset();
          closeAddTask();
        },
      },
    );
  };

  const theme = useMantineTheme();

  // Get column color based on column name
  const getColumnColor = () => {
    const name = column.name.toLowerCase();
    if (
      name.includes('to do') ||
      name.includes('todo') ||
      name.includes('backlog')
    ) {
      return theme.colors.blue[1];
    } else if (name.includes('in progress') || name.includes('doing')) {
      return theme.colors.yellow[1];
    } else if (name.includes('done') || name.includes('completed')) {
      return theme.colors.green[1];
    } else {
      return theme.colors.gray[1];
    }
  };

  // Get column header color
  const getColumnHeaderColor = () => {
    const name = column.name.toLowerCase();
    if (
      name.includes('to do') ||
      name.includes('todo') ||
      name.includes('backlog')
    ) {
      return theme.colors.blue[6];
    } else if (name.includes('in progress') || name.includes('doing')) {
      return theme.colors.yellow[7];
    } else if (name.includes('done') || name.includes('completed')) {
      return theme.colors.green[6];
    } else {
      return theme.colors.gray[6];
    }
  };

  return (
    <div
      style={{
        width: '280px',
        minWidth: '280px',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      <Paper
        p={0}
        radius="sm"
        withBorder
        style={{
          width: '100%',
          backgroundColor: isOver ? `${getColumnColor()}99` : getColumnColor(), // Add opacity when hovering
          borderColor: isOver ? getColumnHeaderColor() : theme.colors.gray[3],
          transition: 'background-color 0.2s, border-color 0.2s',
          overflow: 'hidden',
          boxShadow: isOver ? '0 0 10px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
            backgroundColor: `${getColumnHeaderColor()}1A`, // 10% opacity using hex
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text fw={600} size="sm">
              {column.name}
            </Text>
            <Badge size="sm" variant="light" color={getColumnHeaderColor()}>
              {tasks.length}
            </Badge>
          </div>
          <ActionIcon variant="subtle" size="sm">
            <IconDotsVertical size={14} />
          </ActionIcon>
        </div>

        {/* Task list */}
        <Stack mt="md" mb="md" style={{ gap: '12px', padding: '0 12px' }}>
          {tasks.map((task) => (
            <KanbanTask
              key={task.id}
              task={task}
              assignments={getAssignments(task.id)}
              isDragging={activeTaskId === task.id.toString()}
              onClick={() => onEditTask(task)}
            />
          ))}
        </Stack>
      </Paper>

      {/* Add task form */}
      <Paper
        withBorder
        p="xs"
        mt="sm"
        radius="sm"
        style={{ margin: '0 0 12px 0' }}
      >
        <Divider my="xs" />

        {isAddingTask ? (
          <form
            onSubmit={form.onSubmit(handleAddTask)}
            style={{ padding: '0 12px 12px' }}
          >
            <TextInput
              placeholder="Enter task title"
              {...form.getInputProps('title')}
              autoFocus
              size="sm"
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '8px',
                gap: '8px',
              }}
            >
              <Button variant="subtle" onClick={closeAddTask} size="xs">
                Cancel
              </Button>
              <Button type="submit" size="xs" color={getColumnHeaderColor()}>
                Add Task
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="subtle"
            leftSection={<IconPlus size={14} />}
            onClick={openAddTask}
            fullWidth
            mx="auto"
            mb={12}
            mt={4}
            size="xs"
            styles={() => ({
              root: {
                margin: '0 12px 12px',
                width: 'calc(100% - 24px)',
                color: getColumnHeaderColor(),
              },
              leftSection: {
                marginRight: 6,
              },
            })}
          >
            Add Task
          </Button>
        )}
      </Paper>
    </div>
  );
};
