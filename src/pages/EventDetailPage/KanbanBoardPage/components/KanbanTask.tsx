import React from 'react';
import { Paper, Text, Menu, Box, Badge, Avatar, Tooltip, useMantineTheme } from '@mantine/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';
import { 
  IconDots, 
  IconPencil, 
  IconTrash, 
  IconCalendarEvent, 
  IconArrowUp,
  IconArrowDown,
  IconMinus
} from '@tabler/icons-react';
import { KanbanTask as IKanbanTask, TaskAssignment } from '@/api/kanban.client';
import { useDeleteKanbanTask } from '@/mutations/useDeleteKanbanTask';
import { formatDate } from '@/utils/dates';
import { useParams } from 'react-router-dom';

interface KanbanTaskProps {
  task: IKanbanTask;
  assignments: TaskAssignment[];
  isDragging: boolean;
  onClick: () => void;
  columnColor?: string;
}

export const KanbanTask: React.FC<KanbanTaskProps> = memo(({
  task,
  assignments,
  isDragging,
  onClick,
}) => {
  const { eventId } = useParams();
  const theme = useMantineTheme();

  // Setup delete task mutation
  const deleteTask = useDeleteKanbanTask(eventId);

  // Setup sortable hooks for drag-and-drop
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging: isDraggingInternal 
  } = useSortable({
    id: `task-${task.id}`,
    data: {
      type: 'task',
      task,
      id: task.id,
      columnId: task.columnId
    },
  });

  // Combine the internal isDragging state from useSortable with the prop
  const isCurrentlyDragging = isDragging || isDraggingInternal;
  
  // Create dynamic styles for drag state
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentlyDragging ? 0.6 : 1,
    zIndex: isCurrentlyDragging ? 100 : 1,
    position: 'relative' as const,
    cursor: isCurrentlyDragging ? 'grabbing' : 'grab',
    backgroundColor: isCurrentlyDragging ? theme.colors.gray[1] : undefined,
    boxShadow: isCurrentlyDragging ? '0 5px 10px rgba(0, 0, 0, 0.15)' : undefined,
  };

  // Handle delete task confirmation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(`Are you sure you want to delete "${task.title}" task?`)
    ) {
      deleteTask.mutate(task.id);
    }
  };

  // Format due date if exists
  const formattedDueDate = task.dueDate
    ? formatDate(task.dueDate.toString(), 'dd/MM/yyyy', 'Asia/Bangkok')
    : null;
  
  // Determine if task is due soon (within 3 days) or overdue
  const isDueSoon = () => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today;
  };

  // Get task priority (simulate priority based on task ID for now)
  const getPriority = () => {
    const id = task.id % 4;
    if (id === 0) return { label: 'Highest', color: 'red', icon: <IconArrowUp size={12} /> };
    if (id === 1) return { label: 'High', color: 'orange', icon: <IconArrowUp size={12} /> };
    if (id === 2) return { label: 'Medium', color: 'yellow', icon: <IconMinus size={12} /> };
    return { label: 'Low', color: 'blue', icon: <IconArrowDown size={12} /> };
  };

  const priority = getPriority();

  return (
    <Paper
      ref={setNodeRef}
      shadow="xs"
      p="md"
      radius="sm"
      withBorder
      onClick={onClick}
      {...attributes}
      {...listeners}
      style={{
        ...style,
        position: 'relative',
        padding: '10px 12px',
        // Add left border with priority color
        borderLeft: `3px solid ${theme.colors[priority.color][6]}`,
        '&:hover': {
          backgroundColor: theme.colors.gray[0],
        },
      }}
    >
      {/* Task priority indicator */}
      <div style={{ position: 'absolute', top: '10px', right: '30px' }}>
        <Tooltip label={`Priority: ${priority.label}`} position="top" withArrow>
          <Badge size="xs" color={priority.color} variant="filled" p={0} style={{ width: '16px', height: '16px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {priority.icon}
          </Badge>
        </Tooltip>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <Text size="sm" fw={500} lineClamp={2}>
          {task.title}
        </Text>

        <Menu shadow="md" width={180} position="bottom-end">
          <Menu.Target>
            <Box
              component="button"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <IconDots size={16} />
            </Box>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item 
              leftSection={<IconPencil size={16} />}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Edit Task
            </Menu.Item>
            <Menu.Item 
              leftSection={<IconTrash size={16} />}
              color="red"
              onClick={handleDelete}
            >
              Delete Task
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      {task.description && (
        <Text size="xs" color="dimmed" lineClamp={2} mb={8} style={{ marginTop: '4px' }}>
          {task.description}
        </Text>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <div>
          {formattedDueDate && (
            <Badge 
              size="xs" 
              color={isOverdue() ? 'red' : isDueSoon() ? 'orange' : 'gray'} 
              variant="dot"
              leftSection={<IconCalendarEvent size={10} />}
            >
              {formattedDueDate}
            </Badge>
          )}
        </div>

        {assignments.length > 0 && (
          <Avatar.Group spacing="sm">
            {assignments.slice(0, 3).map((assignment) => (
              <Avatar
                key={assignment.id}
                size="xs"
                radius="xl"
                color="blue"
              >
                {assignment.memberId.substring(0, 2).toUpperCase()}
              </Avatar>
            ))}
            {assignments.length > 3 && (
              <Avatar size="xs" radius="xl" color="gray">
                +{assignments.length - 3}
              </Avatar>
            )}
          </Avatar.Group>
        )}
      </div>
    </Paper>
  );
});
