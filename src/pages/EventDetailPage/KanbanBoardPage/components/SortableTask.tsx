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
  Transition,
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
  const [isHovered, setIsHovered] = useState(false);
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
        shadow={isHovered ? 'sm' : 'xs'}
        p="md"
        radius="md"
        withBorder
        style={{
          transform: CSS.Transform.toString(transform),
          transition: `${transition}, all 0.2s ease`,
          margin: '0 0 8px 0',
          padding: '12px 14px',
          cursor: 'pointer',
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 100 : 1,
          borderLeft: `4px solid ${theme.colors[priorityInfo.color][6]}`,
          boxShadow: isDragging
            ? '0 8px 16px rgba(0, 0, 0, 0.1)'
            : isHovered
            ? '0 4px 8px rgba(0, 0, 0, 0.05)'
            : undefined,
          backgroundColor: isDragging
            ? theme.colors.gray[1]
            : isHovered
            ? theme.white
            : theme.colors.gray[0],
          position: 'relative',
          touchAction: 'none',
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...attributes}
      >
        {/* Drag handle */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '2px',
            transform: 'translateY(-50%)',
            cursor: isDragging ? 'grabbing' : 'grab',
            color: theme.colors.gray[5],
            display: 'flex',
            alignItems: 'center',
            opacity: isHovered ? 0.8 : 0.4,
            padding: '16px 4px',
            transition: 'opacity 0.2s ease',
            touchAction: 'none',
          }}
          {...listeners}
        >
          <IconGripVertical size={14} />
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '0 0 0 16px',
            gap: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Task header with title and menu */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <Text
              size="lg"
              c="dark.7"
              fw={600}
              style={{
                cursor: 'pointer',
                lineHeight: 1.4,
                flex: 1,
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: theme.colors.blue[6],
                },
              }}
            >
              {task.title}
            </Text>

            {/* Three-dot menu for task actions */}
            {(onDelete || onChangeStatus) && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="gray"
                    aria-label="Task actions"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      opacity: isHovered ? 1 : 0.6,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Task Actions</Menu.Label>
                  <Menu.Item
                    leftSection={<IconEdit size={16} />}
                    onClick={handleEditClick}
                  >
                    Edit task
                  </Menu.Item>

                  {onChangeStatus && availableColumns && (
                    <Menu.Item
                      leftSection={<IconArrowsExchange size={16} />}
                      onClick={handleStatusClick}
                    >
                      Change status
                    </Menu.Item>
                  )}

                  {onDelete && (
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={16} />}
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
            <Group gap={6} mt={2}>
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
                      size="sm"
                      color={labelInfo.color}
                      variant="light"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                      }}
                      leftSection={labelInfo.icon}
                    >
                      {labelInfo.label}
                    </Badge>
                  </Tooltip>
                );
              })}
            </Group>
          )}

          {/* Task metadata */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '4px',
              gap: '8px',
            }}
          >
            {/* Due date */}
            <div>
              {formattedDueDate && (
                <Badge
                  size="sm"
                  color={isOverdue() ? 'red' : isDueSoon() ? 'orange' : 'gray'}
                  variant="light"
                  leftSection={<IconCalendarEvent size={12} />}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {formattedDueDate}
                </Badge>
              )}
            </div>

            {/* Assigned users */}
            {assignments.length > 0 && (
              <Avatar.Group spacing="xs">
                {assignments.slice(0, 3).map((assignment) => (
                  <Avatar
                    key={assignment.id}
                    size="sm"
                    radius="xl"
                    color="blue"
                    style={{
                      border: `2px solid ${theme.white}`,
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {assignment.member.firstName.charAt(0).toUpperCase() +
                      assignment.member.lastName.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
                {assignments.length > 3 && (
                  <Avatar
                    size="sm"
                    radius="xl"
                    style={{
                      border: `2px solid ${theme.white}`,
                      backgroundColor: theme.colors.gray[3],
                      color: theme.colors.gray[7],
                    }}
                  >
                    +{assignments.length - 3}
                  </Avatar>
                )}
              </Avatar.Group>
            )}
          </div>
        </div>
      </Paper>

      {/* Status change modal */}
      {onChangeStatus && availableColumns && (
        <Modal
          opened={statusChangeOpen}
          onClose={() => setStatusChangeOpen(false)}
          title="Change task status"
          size="xs"
          centered
          styles={{
            title: {
              fontWeight: 600,
              fontSize: '1.1rem',
            },
          }}
        >
          <Text size="sm" fw={500} mb={12}>
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
            styles={{
              input: {
                '&:focus': {
                  borderColor: theme.colors.blue[6],
                },
              },
            }}
          />
        </Modal>
      )}
    </>
  );
};
