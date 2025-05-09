import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Paper,
  Text,
  Badge,
  Avatar,
  Tooltip,
  useMantineTheme,
  Group,
  Menu,
  ActionIcon,
  Popover,
  Select,
  Modal,
} from '@mantine/core';
import {
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconCalendarEvent,
  IconGripVertical,
  IconBug,
  IconTools,
  IconFileText,
  IconListCheck,
  IconStarFilled,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconArrowsExchange,
} from '@tabler/icons-react';

import {
  KanbanTask,
  TaskAssignment,
  TaskPriority,
  TaskLabel,
} from '@/api/kanban.client';
import { formatDate } from '@/utils/dates';

interface SortableTaskProps {
  task: KanbanTask;
  assignments: TaskAssignment[];
  onClick: () => void;
  onDelete?: (taskId: number) => void;
  onChangeStatus?: (taskId: number, columnId: number) => void;
  availableColumns?: { value: string; label: string }[];
}

export const SortableTask: React.FC<SortableTaskProps> = ({
  task,
  assignments,
  onClick,
  onDelete,
  onChangeStatus,
  availableColumns,
}) => {
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const theme = useMantineTheme();

  // Set up sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task-${task.id}`,
    data: {
      type: 'task',
      task,
    },
  });

  // Format due date
  const formattedDueDate = task.dueDate
    ? formatDate(task.dueDate, 'YYYY MMM DD', 'Asia/Bangkok')
    : null;

  // Calculate if task is due soon or overdue
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

  // Get task priority with proper icon and color
  const getPriorityInfo = (priority: TaskPriority = 'medium') => {
    switch (priority) {
      case 'highest':
        return {
          label: 'Highest',
          color: 'red',
          icon: <IconArrowUp size={12} />,
        };
      case 'high':
        return {
          label: 'High',
          color: 'orange',
          icon: <IconArrowUp size={12} />,
        };
      case 'medium':
        return {
          label: 'Medium',
          color: 'yellow',
          icon: <IconMinus size={12} />,
        };
      case 'low':
        return {
          label: 'Low',
          color: 'blue',
          icon: <IconArrowDown size={12} />,
        };
      case 'lowest':
        return {
          label: 'Lowest',
          color: 'gray',
          icon: <IconArrowDown size={12} />,
        };
      default:
        return {
          label: 'Medium',
          color: 'yellow',
          icon: <IconMinus size={12} />,
        };
    }
  };

  // Get label info (icon, color, etc)
  const getLabelInfo = (label: TaskLabel) => {
    switch (label) {
      case 'bug':
        return { label: 'Bug', color: 'red', icon: <IconBug size={12} /> };
      case 'feature':
        return {
          label: 'Feature',
          color: 'blue',
          icon: <IconStarFilled size={12} />,
        };
      case 'improvement':
        return {
          label: 'Improvement',
          color: 'green',
          icon: <IconTools size={12} />,
        };
      case 'documentation':
        return {
          label: 'Documentation',
          color: 'grape',
          icon: <IconFileText size={12} />,
        };
      case 'task':
        return {
          label: 'Task',
          color: 'gray',
          icon: <IconListCheck size={12} />,
        };
      default:
        return {
          label: 'Task',
          color: 'gray',
          icon: <IconListCheck size={12} />,
        };
    }
  };

  // Handle status change
  const handleStatusChange = (value: string | null) => {
    if (value && onChangeStatus) {
      onChangeStatus(task.id, parseInt(value));
      setStatusChangeOpen(false);
    }
  };

  // Handle task actions
  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick();
  };

  const handleStatusClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setStatusChangeOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (
      onDelete &&
      window.confirm('Are you sure you want to delete this task?')
    ) {
      onDelete(task.id);
    }
  };

  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <>
      <Paper
        ref={setNodeRef}
        shadow="xs"
        p="md"
        radius="sm"
        withBorder
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          margin: '0 0 8px 0',
          padding: '10px 12px',
          cursor: 'default', // Change default cursor to normal
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 100 : 1,
          borderLeft: `3px solid ${theme.colors[priorityInfo.color][6]}`,
          boxShadow: isDragging ? '0 5px 10px rgba(0, 0, 0, 0.15)' : undefined,
          backgroundColor: isDragging ? theme.colors.gray[1] : undefined,
          position: 'relative',
          touchAction: 'none', // Prevent scrolling on touch devices while dragging
        }}
        onClick={onClick}
        {...attributes} // Place attributes here without any touch listeners
      >
        {/* Drag handle */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '2px',
            transform: 'translateY(-50%)',
            cursor: isDragging ? 'grabbing' : 'grab', // Change cursor during drag
            color: theme.colors.gray[5],
            display: 'flex',
            alignItems: 'center',
            opacity: isDragging ? 0.8 : 0.5, // Slightly more visible when dragging
            padding: '16px 4px', // Wider area for easier grabbing
            touchAction: 'none', // Prevent scrolling on touch devices
          }}
          {...listeners} // Apply listeners only to the drag handle
        >
          <IconGripVertical size={12} />
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '0 0 0 12px',
            gap: '6px',
            overflow: 'hidden',
          }}
        >
          {/* Task header with title and menu */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Text
              size="sm"
              fw={500}
              style={{ cursor: 'pointer', lineHeight: 1.3, flex: 1 }}
            >
              {task.title}
            </Text>

            {/* Three-dot menu for task actions */}
            {(onDelete || onChangeStatus) && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    aria-label="Task actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconDotsVertical size={14} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Task Actions</Menu.Label>

                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={handleEditClick}
                  >
                    Edit task
                  </Menu.Item>

                  {onChangeStatus && availableColumns && (
                    <Menu.Item
                      leftSection={<IconArrowsExchange size={14} />}
                      onClick={handleStatusClick}
                    >
                      Change status
                    </Menu.Item>
                  )}

                  {onDelete && (
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={handleDeleteClick}
                    >
                      Delete task
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            )}
          </div>

          {/* Task labels if any */}
          {task.labels && task.labels.length > 0 && (
            <Group gap={4} mt={5}>
              {task.labels.map((label) => {
                const labelInfo = getLabelInfo(label);
                return (
                  <Tooltip
                    key={label}
                    label={labelInfo.label}
                    position="top"
                    withArrow
                  >
                    <Badge
                      size="xs"
                      color={labelInfo.color}
                      variant="light"
                      style={{ padding: '3px 6px' }}
                      leftSection={labelInfo.icon}
                    >
                      {labelInfo.label}
                    </Badge>
                  </Tooltip>
                );
              })}
            </Group>
          )}

          {/* Task description preview */}
          {task.description && (
            <Text
              size="xs"
              color="dimmed"
              lineClamp={2}
              style={{ marginBottom: '8px' }}
            >
              {task.description}
            </Text>
          )}

          {/* Task metadata */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px',
            }}
          >
            {/* Due date */}
            <div>
              {formattedDueDate && (
                <Badge
                  size="md"
                  color={isOverdue() ? 'red' : isDueSoon() ? 'orange' : 'gray'}
                  variant="dot"
                  leftSection={<IconCalendarEvent size={10} />}
                >
                  {formattedDueDate}
                </Badge>
              )}
            </div>

            {/* Assigned users */}
            {assignments.length > 0 && (
              <Avatar.Group spacing="sm">
                {assignments.slice(0, 3).map((assignment) => (
                  <Avatar
                    key={assignment.id}
                    size="xs"
                    radius="xl"
                    color="blue"
                  >
                    {/* Display first character of assignment ID as fallback */}
                    {assignment.member.firstName.charAt(0).toUpperCase() +
                      assignment.member.lastName.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
                {assignments.length > 3 && (
                  <Avatar size="xs" radius="xl">
                    +{assignments.length - 3}
                  </Avatar>
                )}
              </Avatar.Group>
            )}
          </div>
        </div>
      </Paper>

      {/* Use Modal instead of Popover for status change */}
      {onChangeStatus && availableColumns && (
        <Modal
          opened={statusChangeOpen}
          onClose={() => setStatusChangeOpen(false)}
          title="Change task status"
          size="xs"
          centered
        >
          <Text size="sm" fw={500} mb={10}>
            Move task to:
          </Text>
          <Select
            data={
              availableColumns?.filter(
                (col) => col.value !== String(task.columnId),
              ) || []
            }
            placeholder="Select status"
            onChange={handleStatusChange}
            searchable
            clearable={false}
            autoFocus
          />
        </Modal>
      )}
    </>
  );
};
