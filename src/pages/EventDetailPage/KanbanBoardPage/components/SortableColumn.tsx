import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Paper,
  Text,
  Button,
  TextInput,
  ActionIcon,
  ColorSwatch,
  Popover,
  Stack,
  useMantineTheme,
  Menu,
  ColorPicker,
  Group,
  Box,
  Modal,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconDotsVertical,
  IconTrash,
  IconColorSwatch,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

import {
  KanbanColumn as IKanbanColumn,
  KanbanTask as IKanbanTask,
  TaskAssignment,
} from '@/api/kanban.client';
import { SortableTask } from './SortableTask';

interface SortableColumnProps {
  id: string;
  column: IKanbanColumn;
  tasks: IKanbanTask[];
  onTaskClick: (task: IKanbanTask) => void;
  getAssignments: (taskId: number) => TaskAssignment[];
  onDeleteColumn?: (columnId: number) => void;
  onAddTask?: (columnId: number, taskTitle?: string) => void;
  onMoveColumn?: (columnId: number, direction: 'left' | 'right') => void;
  isFirstColumn?: boolean;
  isLastColumn?: boolean;
  isHighlighted?: boolean;
  onChangeColor?: (columnId: number, color: string) => void;
  customColor?: string;
  onDeleteTask?: (taskId: number) => void;
  onChangeTaskStatus?: (taskId: number, columnId: number) => void;
  availableColumns?: { value: string; label: string }[];
  onUpdateColumn?: (columnId: number, name: string) => void;
}

export const SortableColumn: React.FC<SortableColumnProps> = ({
  id,
  column,
  tasks,
  onTaskClick,
  getAssignments,
  onDeleteColumn,
  onAddTask,
  onMoveColumn,
  isFirstColumn = false,
  isLastColumn = false,
  isHighlighted = false,
  onChangeColor,
  customColor,
  onDeleteTask,
  onChangeTaskStatus,
  availableColumns,
  onUpdateColumn,
}) => {
  const theme = useMantineTheme();
  const [isAddingTask, { open: openAddTask, close: closeAddTask }] =
    useDisclosure(false);
  const [
    colorPickerOpened,
    { toggle: toggleColorPicker, close: closeColorPicker },
  ] = useDisclosure(false);
  const tasksContainerRef = useRef<HTMLDivElement>(null);

  // Column name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempColumnName, setTempColumnName] = useState('');

  // Set up sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'column',
      column,
    },
  });

  // Form for adding new tasks
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
    },
    validate: {
      title: (value) =>
        value.trim().length === 0 ? 'Title is required' : null,
    },
  });

  // Quick form for inline task creation
  const quickForm = useForm({
    initialValues: {
      title: '',
    },
    validate: {
      title: (value) =>
        value.trim().length === 0 ? 'Title is required' : null,
    },
  });

  // Auto scroll to bottom when tasks change
  useEffect(() => {
    if (tasksContainerRef.current) {
      tasksContainerRef.current.scrollTop =
        tasksContainerRef.current.scrollHeight;
    }
  }, [tasks]);

  // Handle quick form submission
  const handleQuickSubmit = quickForm.onSubmit((values) => {
    if (onAddTask) {
      onAddTask(column.id, values.title);
      quickForm.reset();
      closeAddTask();
    }
  });

  // Handle column color change
  const handleColorChange = (color: string) => {
    if (onChangeColor) {
      onChangeColor(column.id, color);
      closeColorPicker();
    }
  };

  // Column name editing handlers
  const handleColumnNameDoubleClick = (e: React.MouseEvent) => {
    // Prevent event propagation to avoid triggering drag
    e.stopPropagation();
    setTempColumnName(column.name);
    setIsEditingName(true);
  };

  const handleSaveColumnName = () => {
    if (tempColumnName.trim() && onUpdateColumn) {
      onUpdateColumn(column.id, tempColumnName);
    }
    setIsEditingName(false);
  };

  const handleCancelEditColumnName = () => {
    setIsEditingName(false);
  };

  // Get default color based on column name
  const getDefaultColumnColor = (name: string) => {
    const normalizedName = name.toLowerCase().trim();

    if (
      normalizedName === 'to do' ||
      normalizedName === 'todo' ||
      normalizedName === 'backlog'
    ) {
      return theme.colors.blue[7];
    } else if (
      normalizedName === 'in progress' ||
      normalizedName === 'ongoing' ||
      normalizedName === 'doing'
    ) {
      return theme.colors.orange[7];
    } else if (normalizedName === 'done' || normalizedName === 'completed') {
      return theme.colors.green[7];
    } else if (normalizedName === 'blocked' || normalizedName === 'issues') {
      return theme.colors.red[7];
    } else if (normalizedName === 'testing' || normalizedName === 'review') {
      return theme.colors.violet[7];
    } else {
      return theme.colors.blue[7]; // Default color
    }
  };

  // Column header styles
  const headerBackgroundColor =
    customColor || getDefaultColumnColor(column.name);
  const headerTextColor = theme.white;

  // Column container styles with conditional highlighting
  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '280px',
    minWidth: '280px',
    height: 'calc(100vh - 200px)',
    margin: '0 8px',
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={columnStyle} {...attributes}>
      <Paper
        shadow="xs"
        radius="md"
        withBorder
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: isHighlighted ? theme.colors.gray[1] : undefined,
          border: isHighlighted
            ? `1px solid ${theme.colors.blue[5]}`
            : undefined,
        }}
      >
        {/* Column header */}
        <div
          style={{
            backgroundColor: headerBackgroundColor,
            color: headerTextColor,
            padding: '10px 16px',
            borderTopLeftRadius: theme.radius.md,
            borderTopRightRadius: theme.radius.md,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            cursor: 'grab',
          }}
          {...listeners}
        >
          <Group gap="sm" style={{ flexGrow: 1 }}>
            {isEditingName ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth: '180px',
                }}
              >
                <TextInput
                  value={tempColumnName}
                  onChange={(e) => setTempColumnName(e.target.value)}
                  size="xs"
                  variant="filled"
                  style={{ flexGrow: 1 }}
                  autoFocus
                  rightSection={
                    <Box style={{ display: 'flex', gap: 0 }}>
                      <Button
                        variant="transparent"
                        color="green"
                        size="xs"
                        onClick={handleSaveColumnName}
                        style={{ height: 22, width: 22, padding: 0 }}
                        title="Save"
                      >
                        <IconCheck size={14} />
                      </Button>
                      <Button
                        variant="transparent"
                        color="red"
                        size="xs"
                        onClick={handleCancelEditColumnName}
                        style={{ height: 22, width: 22, padding: 0 }}
                        title="Cancel"
                      >
                        <IconX size={14} />
                      </Button>
                    </Box>
                  }
                  styles={{
                    input: {
                      color: headerTextColor,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      '&:focus': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveColumnName();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancelEditColumnName();
                    }
                  }}
                />
              </div>
            ) : (
              <Text
                fw={600}
                fz="sm"
                style={{ cursor: 'pointer' }}
                onDoubleClick={handleColumnNameDoubleClick}
              >
                {column.name}
              </Text>
            )}
            {!isEditingName && (
              <Text size="xs" c="gray.2" fw={400}>
                {tasks.length}
              </Text>
            )}
          </Group>

          <Group gap="xs">
            {onAddTask && (
              <>
                <ActionIcon
                  variant="transparent"
                  color="gray.0"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAddTask();
                  }}
                  title="Add task"
                  style={{
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </>
            )}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="transparent"
                  color="gray.0"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Column Actions</Menu.Label>

                {onMoveColumn && !isFirstColumn && (
                  <Menu.Item
                    leftSection={<IconChevronLeft size={14} />}
                    onClick={() => onMoveColumn(column.id, 'left')}
                  >
                    Move left
                  </Menu.Item>
                )}

                {onMoveColumn && !isLastColumn && (
                  <Menu.Item
                    leftSection={<IconChevronRight size={14} />}
                    onClick={() => onMoveColumn(column.id, 'right')}
                  >
                    Move right
                  </Menu.Item>
                )}

                {onChangeColor && (
                  <Menu.Item
                    leftSection={<IconColorSwatch size={14} />}
                    onClick={toggleColorPicker}
                    closeMenuOnClick={false}
                  >
                    <div style={{ position: 'relative' }}>
                      Change color
                      <Popover
                        opened={colorPickerOpened}
                        onChange={closeColorPicker}
                        position="right"
                        withArrow
                        shadow="md"
                      >
                        <Popover.Target>
                          <div></div>
                        </Popover.Target>
                        <Popover.Dropdown>
                          <ColorPicker
                            format="hex"
                            value={customColor || theme.colors.blue[7]}
                            onChange={handleColorChange}
                            swatches={[
                              theme.colors.blue[7],
                              theme.colors.cyan[7],
                              theme.colors.green[7],
                              theme.colors.yellow[7],
                              theme.colors.orange[7],
                              theme.colors.red[7],
                              theme.colors.pink[7],
                              theme.colors.violet[7],
                            ]}
                          />
                        </Popover.Dropdown>
                      </Popover>
                    </div>
                  </Menu.Item>
                )}

                {onDeleteColumn && (
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => {
                      if (window.confirm(`Delete column "${column.name}"?`)) {
                        onDeleteColumn(column.id);
                      }
                    }}
                  >
                    Delete column
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </div>

        {/* Tasks container with scrolling */}
        <div
          ref={tasksContainerRef}
          style={{
            padding: '10px',
            flexGrow: 1,
            overflowY: 'auto',
            backgroundColor: theme.colors.gray[0],
          }}
        >
          {tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              assignments={getAssignments(task.id)}
              onClick={() => onTaskClick(task)}
              onDelete={onDeleteTask}
              onChangeStatus={onChangeTaskStatus}
              availableColumns={availableColumns}
            />
          ))}

          {tasks.length === 0 && (
            <Text c="dimmed" ta="center" fz="sm" py="xl">
              No tasks
            </Text>
          )}

          {/* Quick add task form */}
          {isAddingTask ? (
            <Paper p="xs" shadow="xs" mt="md" withBorder>
              <form onSubmit={handleQuickSubmit}>
                <TextInput
                  placeholder="Enter task title"
                  size="sm"
                  {...quickForm.getInputProps('title')}
                  autoFocus
                />
                <Group mt="xs" justify="flex-end">
                  <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={() => {
                      closeAddTask();
                      quickForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="xs">
                    Add
                  </Button>
                </Group>
              </form>
            </Paper>
          ) : (
            onAddTask && (
              <Button
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                leftSection={<IconPlus size={14} />}
                onClick={openAddTask}
                size="sm"
              >
                Add task
              </Button>
            )
          )}
        </div>
      </Paper>
    </div>
  );
};
