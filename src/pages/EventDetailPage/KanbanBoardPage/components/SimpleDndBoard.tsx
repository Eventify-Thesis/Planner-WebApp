import React, { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import {
  useMantineTheme,
  Button,
  TextInput,
  Group,
  Modal,
  Box,
  ActionIcon,
  Select,
  Input,
  Text,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconX,
  IconTrash,
  IconAlertTriangle,
} from '@tabler/icons-react';

import {
  KanbanTask as IKanbanTask,
  KanbanColumn as IKanbanColumn,
  TaskAssignment,
  TaskLabel,
  TaskPriority,
} from '@/api/kanban.client';
// Use direct relative paths for all component imports to fix module resolution issues
import { SortableColumn } from '../../../EventDetailPage/KanbanBoardPage/components/SortableColumn';
import { TaskEditModal } from '../../../EventDetailPage/KanbanBoardPage/components/TaskEditModal';
import { SortableTask } from '../../../EventDetailPage/KanbanBoardPage/components/SortableTask';
import { useKanban } from '../context/KanbanContext';

import './SimpleDndBoard.css';

// This interface is kept for reference, but not used directly anymore
interface SimpleDndBoardProps {
  eventId?: number;
  columns?: IKanbanColumn[];
  tasks?: IKanbanTask[];
  assignments?: TaskAssignment[];
  onTaskMove?: (
    taskId: number,
    data: { columnId?: number; position: number },
  ) => void;
  onColumnCreate?: (data: { name: string; position: number }) => void;
  onColumnDelete?: (columnId: number) => void;
  onColumnMove?: (columnId: number, newPosition: number) => void;
  onTaskCreate?: (data: {
    columnId: number;
    title: string;
    position: number;
    description?: string;
    priority?: string;
    labels?: string[];
  }) => void;
}

// Component now uses KanbanContext directly instead of props
export const SimpleDndBoard: React.FC<SimpleDndBoardProps> = () => {
  // Use the KanbanContext instead of props
  const {
    eventId,
    columns,
    tasks, // Now using tasks directly from context
    assignments,
    setTasks, // Get the tasks setter from context
    getTasksByColumn, // Get helper function from context
    moveTask: onTaskMove,
    createTask: onTaskCreate,
    deleteTask: onTaskDelete,
    createColumn: onColumnCreate,
    deleteColumn: onColumnDelete,
    moveColumn: onColumnMove,
    updateColumn: onColumnUpdate,
  } = useKanban();

  // Local UI state only
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<IKanbanTask | null>(null);
  const theme = useMantineTheme();

  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Column customization state
  const [columnColors, setColumnColors] = useState<Record<number, string>>({});

  // Modal state for adding columns and tasks
  const [
    isAddColumnModalOpen,
    { open: openAddColumnModal, close: closeAddColumnModal },
  ] = useDisclosure(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Task creation modal and state
  const [
    isAddTaskModalOpen,
    { open: openAddTaskModal, close: closeAddTaskModal },
  ] = useDisclosure(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);

  // Delete task modal state
  const [
    isDeleteModalOpen,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [taskToDelete, setTaskToDelete] = useState<IKanbanTask | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Drag and drop state
  const [isDraggingOver, setIsDraggingOver] = useState<number | null>(null);

  // Debug effect to monitor modal state
  React.useEffect(() => {
    console.log('Delete modal state changed:', {
      isDeleteModalOpen,
      taskToDelete: taskToDelete?.id,
      isDeleting,
    });
  }, [isDeleteModalOpen, taskToDelete, isDeleting]);

  // No longer need to sync with server data - the context handles this

  // Configure sensors for better drag control
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 8 pixels before activating
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 200ms, with 8px tolerance for better mobile experience
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
  );

  // Get task assignments
  const getAssignmentsByTask = (taskId: number) => {
    return assignments.filter((assignment) => assignment.taskId === taskId);
  };

  // Use the column tasks with search filtering and column filtering
  const getFilteredTasksByColumn = (columnId: number) => {
    // If column filter is active and this column doesn't match, return empty array
    if (filterColumn && filterColumn !== columnId.toString()) {
      return [];
    }
    return getTasksByColumn(columnId, searchQuery);
  };

  // Find active task
  const getActiveTask = () => {
    if (!activeId) return null;

    const taskId = activeId.replace('task-', '');
    return tasks.find((task) => task.id.toString() === taskId) || null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Extract task ID
    if (!activeId.startsWith('task-')) {
      setActiveId(null);
      return;
    }

    const taskId = parseInt(activeId.replace('task-', ''));
    const activeTask = tasks.find((t) => t.id === taskId);

    if (!activeTask) {
      setActiveId(null);
      return;
    }

    // Case 1: Dropping on a column
    if (overId.startsWith('column-')) {
      const columnId = parseInt(overId.replace('column-', ''));

      if (activeTask.columnId === columnId) {
        setActiveId(null);
        return;
      }

      // Get destination column tasks
      const columnTasks = getTasksByColumn(columnId);
      const newPosition = columnTasks.length; // Add at the end

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, columnId, position: newPosition }
            : task,
        ),
      );

      // Update server
      onTaskMove(taskId, { columnId, position: newPosition });
    }
    // Case 2: Dropping on another task
    else if (overId.startsWith('task-')) {
      const overTaskId = parseInt(overId.replace('task-', ''));
      const overTask = tasks.find((t) => t.id === overTaskId);

      if (!overTask) {
        setActiveId(null);
        return;
      }

      // Same column reordering
      if (activeTask.columnId === overTask.columnId) {
        const columnTasks = getFilteredTasksByColumn(activeTask.columnId);

        const oldIndex = columnTasks.findIndex((t) => t.id === taskId);
        const newIndex = columnTasks.findIndex((t) => t.id === overTaskId);

        if (oldIndex !== -1 && newIndex !== -1) {
          // Reorder tasks
          const newOrder = arrayMove(columnTasks, oldIndex, newIndex);

          // Update positions
          const updatedTasks = newOrder.map((task, index) => ({
            ...task,
            position: index,
          }));

          // Update local state
          setTasks((prevTasks) => {
            return prevTasks.map((task) => {
              if (task.columnId === activeTask.columnId) {
                const updatedTask = updatedTasks.find((t) => t.id === task.id);
                return updatedTask || task;
              }
              return task;
            });
          });

          // Update server
          onTaskMove(taskId, { position: newIndex });
        }
      }
      // Cross-column move
      else {
        const sourceColumnId = activeTask.columnId;
        const destColumnId = overTask.columnId;

        // Get tasks in destination column
        const destColumnTasks = getFilteredTasksByColumn(destColumnId);
        const insertIndex = destColumnTasks.findIndex(
          (t) => t.id === overTaskId,
        );

        if (insertIndex !== -1) {
          // Clone the tasks
          const newTasks = [...tasks];

          // Remove the task from its current position
          const filteredTasks = newTasks.filter((t) => t.id !== taskId);

          // Create the updated task
          const updatedTask = { ...activeTask, columnId: destColumnId };

          // Insert task at new position
          const updatedDestTasks = [
            ...destColumnTasks.slice(0, insertIndex),
            updatedTask,
            ...destColumnTasks.slice(insertIndex),
          ];

          // Update positions for all tasks in destination column
          const reindexedDestTasks = updatedDestTasks.map((task, index) => ({
            ...task,
            position: index,
          }));

          // Update positions for all tasks in source column
          const sourceTasks = filteredTasks.filter(
            (t) => t.columnId === sourceColumnId,
          );
          const reindexedSourceTasks = sourceTasks.map((task, index) => ({
            ...task,
            position: index,
          }));

          // Combine all updated tasks
          const otherTasks = filteredTasks.filter(
            (t) => t.columnId !== sourceColumnId && t.columnId !== destColumnId,
          );

          setTasks([
            ...otherTasks,
            ...reindexedSourceTasks,
            ...reindexedDestTasks,
          ]);

          // Update server
          onTaskMove(taskId, { columnId: destColumnId, position: insertIndex });
        }
      }
    }

    setActiveId(null);
  };

  // Handle task edit
  const handleEditTask = (task: IKanbanTask) => {
    setEditingTask(task);
  };

  // Handle column color change
  const handleColumnColorChange = (columnId: number, color: string) => {
    setColumnColors((prevColors) => ({
      ...prevColors,
      [columnId]: color,
    }));
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setEditingTask(null);
  };

  // Column management handlers
  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;

    onColumnCreate({
      name: newColumnName.trim(),
      position: columns.length,
    });

    setNewColumnName('');
    closeAddColumnModal();
  };

  const handleDeleteColumn = (columnId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this column? All tasks in this column will be deleted as well.',
      )
    ) {
      onColumnDelete(columnId);
    }
  };

  const handleMoveColumn = (columnId: number, direction: 'left' | 'right') => {
    const columnIndex = columns.findIndex((col) => col.id === columnId);
    let newPosition;

    if (direction === 'left' && columnIndex > 0) {
      newPosition = columnIndex - 1;
    } else if (direction === 'right' && columnIndex < columns.length - 1) {
      newPosition = columnIndex + 1;
    } else {
      return; // Can't move further left/right
    }

    onColumnMove(columnId, newPosition);
  };

  const openTaskCreationModal = (columnId: number) => {
    setActiveColumnId(columnId);
    setNewTaskTitle('');
    openAddTaskModal();
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !activeColumnId) return;

    const columnTasks = getTasksByColumn(activeColumnId);
    const newPosition = columnTasks.length;

    await onTaskCreate({
      columnId: activeColumnId,
      title: newTaskTitle.trim(),
      position: newPosition,
      priority: 'medium' as TaskPriority,
      labels: ['task' as TaskLabel],
    });

    setNewTaskTitle('');
    setActiveColumnId(null);
    closeAddTaskModal();
  };

  // Handle inline task creation (direct from the column)
  const handleInlineTaskCreate = (columnId: number, title: string) => {
    if (!title.trim()) return;

    const columnTasks = getTasksByColumn(columnId);
    const position = columnTasks.length;

    // Call the parent's onTaskCreate with the necessary data
    onTaskCreate({
      columnId,
      title: title.trim(),
      position,
      priority: 'medium' as TaskPriority, // Default priority
      labels: ['task' as TaskLabel], // Default label
    });
  };

  // Handle task deletion - open confirmation modal
  const handleDeleteTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      openDeleteModal();
    }
  };

  // Confirm task deletion
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      console.log('Deleting task:', taskToDelete.id);
      await onTaskDelete(taskToDelete.id);
      console.log('Task deleted successfully');

      // Use setTimeout to ensure state updates don't conflict
      setTimeout(() => {
        setTaskToDelete(null);
        closeDeleteModal();
        setIsDeleting(false);
        console.log('Modal closed and state cleared');
      }, 100);
    } catch (error) {
      console.error('Error deleting task:', error);
      // Show error message to user
      alert('Failed to delete task. Please try again.');
      setIsDeleting(false);
      // Keep modal open for retry
    }
  };

  // Cancel task deletion
  const cancelDeleteTask = () => {
    closeDeleteModal();
    setTaskToDelete(null);
    setIsDeleting(false);
  };

  // Handle task status change (column change)
  const handleChangeTaskStatus = async (taskId: number, columnId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // If the task is already in this column, do nothing
    if (task.columnId === columnId) return;

    // Get the tasks in the target column
    const columnTasks = getTasksByColumn(columnId);
    const newPosition = columnTasks.length; // Add at the end

    // Optimistically update the UI
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, columnId, position: newPosition } : t,
      ),
    );

    // Update on the server
    try {
      await onTaskMove(taskId, { columnId, position: newPosition });
    } catch (error) {
      console.error('Error changing task status:', error);
      alert('Failed to change task status. Please try again.');
      // Revert the optimistic update
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...task } : t)),
      );
    }
  };

  // Handle drag over for visual feedback
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setIsDraggingOver(null);
      return;
    }

    // Check if dragging over a column
    if (over.data.current?.type === 'column') {
      setIsDraggingOver(over.data.current.columnId);
    } else {
      setIsDraggingOver(null);
    }
  };

  // Active task for drag overlay
  const activeTask = getActiveTask();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {/* Enhanced Search and filter toolbar */}
        <div className="kanban-toolbar">
          <div className="search-input-wrapper">
            <TextInput
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={18} />}
              rightSection={
                searchQuery ? (
                  <ActionIcon
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    variant="subtle"
                    color="gray"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                ) : null
              }
              ref={searchInputRef}
              styles={{
                input: {
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '2px solid transparent',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    borderColor: theme.colors.blue[5],
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  },
                },
              }}
            />
          </div>

          <div className="filter-wrapper">
            <Select
              placeholder="Filter by column"
              value={filterColumn}
              onChange={setFilterColumn}
              clearable
              leftSection={<IconFilter size={18} />}
              data={[
                ...columns.map((col) => ({
                  value: col.id.toString(),
                  label: col.name,
                })),
              ]}
              styles={{
                input: {
                  fontSize: '14px',
                  fontWeight: 500,
                  border: '2px solid transparent',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    borderColor: theme.colors.violet[5],
                    backgroundColor: '#ffffff',
                    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                  },
                },
              }}
            />
          </div>

          {(searchQuery || filterColumn) && (
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterColumn(null);
              }}
              leftSection={<IconX size={16} />}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="board-columns-wrapper">
          <div className="kanban-columns-container">
            {columns.map((column) => {
              const columnTasks = getFilteredTasksByColumn(column.id);
              const isHighlighted = isDraggingOver === column.id;
              const shouldShowColumn =
                !filterColumn || filterColumn === column.id.toString();

              // Create available columns data for dropdown
              const availableColumns = columns.map((col) => ({
                value: col.id.toString(),
                label: col.name,
              }));

              // Don't render column if it's filtered out
              if (!shouldShowColumn) {
                return null;
              }

              return (
                <SortableColumn
                  key={column.id}
                  id={`column-${column.id}`}
                  column={column}
                  tasks={columnTasks}
                  onTaskClick={handleEditTask}
                  getAssignments={getAssignmentsByTask}
                  onDeleteColumn={handleDeleteColumn}
                  onAddTask={(columnId: number, taskTitle?: string) => {
                    if (taskTitle) {
                      // If a title is provided, it's coming from inline creation
                      handleInlineTaskCreate(columnId, taskTitle);
                    } else {
                      // Otherwise, open the modal
                      openTaskCreationModal(columnId);
                    }
                  }}
                  onMoveColumn={handleMoveColumn}
                  isFirstColumn={columns.indexOf(column) === 0}
                  isLastColumn={columns.indexOf(column) === columns.length - 1}
                  isHighlighted={isHighlighted}
                  onChangeColor={handleColumnColorChange}
                  customColor={columnColors[column.id]}
                  onDeleteTask={handleDeleteTask}
                  onChangeTaskStatus={handleChangeTaskStatus}
                  availableColumns={availableColumns}
                  onUpdateColumn={(columnId, name) =>
                    onColumnUpdate(columnId, { name })
                  }
                />
              );
            })}

            {/* Show filtered columns info */}
            {filterColumn && (
              <div className="filtered-info">
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    textAlign: 'center',
                    minWidth: '200px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Showing only:{' '}
                  <strong>
                    {
                      columns.find((col) => col.id.toString() === filterColumn)
                        ?.name
                    }
                  </strong>
                  <br />
                  <div
                    style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}
                  >
                    {columns.length - 1} other columns hidden
                  </div>
                </div>
              </div>
            )}

            {/* Add column button */}
            {!filterColumn && (
              <div className="add-column-button">
                <Button
                  leftSection={<IconPlus size={18} />}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  onClick={openAddColumnModal}
                  size="md"
                  style={{
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                      },
                    },
                  }}
                >
                  Add Column
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag overlay for visual feedback */}
      <DragOverlay
        adjustScale={false}
        style={{
          transformOrigin: 'center center',
          zIndex: 9999,
        }}
      >
        {activeTask && (
          <div
            className="task-drag-overlay"
            style={{
              transform: 'rotate(3deg)',
              opacity: 0.95,
              cursor: 'grabbing',
              maxWidth: '280px',
              minWidth: '280px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <SortableTask
              task={activeTask}
              assignments={getAssignmentsByTask(activeTask.id)}
              onClick={() => {}}
              // Don't provide delete/status change options for the drag overlay
            />
          </div>
        )}
      </DragOverlay>

      {/* Edit task modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          eventId={eventId.toString()}
          columns={columns}
          assignments={getAssignmentsByTask(editingTask.id)}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Enhanced Add Column Modal */}
      <Modal
        opened={isAddColumnModalOpen}
        onClose={closeAddColumnModal}
        title="Add New Column"
        size="sm"
        centered
        styles={{
          title: {
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.gray[8],
          },
          content: {
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          },
          header: {
            borderBottom: `1px solid ${theme.colors.gray[2]}`,
            paddingBottom: '16px',
            marginBottom: '20px',
          },
        }}
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddColumn();
          }}
        >
          <TextInput
            label="Column Name"
            placeholder="e.g., To Do, In Progress, Done"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            required
            mb="xl"
            autoFocus
            styles={{
              label: {
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: theme.colors.gray[7],
              },
              input: {
                border: `2px solid ${theme.colors.gray[3]}`,
                borderRadius: '8px',
                fontSize: '14px',
                padding: '12px',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: theme.colors.blue[5],
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
              },
            }}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={closeAddColumnModal}
              color="gray"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              size="md"
            >
              Add Column
            </Button>
          </Group>
        </Box>
      </Modal>

      {/* Enhanced Add Task Modal */}
      <Modal
        opened={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        title="Add New Task"
        size="sm"
        centered
        styles={{
          title: {
            fontSize: '18px',
            fontWeight: 600,
            color: theme.colors.gray[8],
          },
          content: {
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          },
          header: {
            borderBottom: `1px solid ${theme.colors.gray[2]}`,
            paddingBottom: '16px',
            marginBottom: '20px',
          },
        }}
      >
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
        >
          <TextInput
            label="Task Title"
            placeholder="What needs to be done?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            mb="xl"
            autoFocus
            styles={{
              label: {
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px',
                color: theme.colors.gray[7],
              },
              input: {
                border: `2px solid ${theme.colors.gray[3]}`,
                borderRadius: '8px',
                fontSize: '14px',
                padding: '12px',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: theme.colors.green[5],
                  boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.1)',
                },
              },
            }}
          />
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={closeAddTaskModal}
              color="gray"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'green', to: 'teal', deg: 45 }}
              size="md"
            >
              Add Task
            </Button>
          </Group>
        </Box>
      </Modal>

      {/* Enhanced Delete Task Confirmation Modal */}
      {taskToDelete && (
        <Modal
          opened={isDeleteModalOpen}
          onClose={cancelDeleteTask}
          title=""
          size="md"
          centered
          withCloseButton={false}
          padding={0}
          styles={{
            content: {
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '2px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <IconAlertTriangle size={32} color="#ef4444" />
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: theme.colors.red[7],
                marginBottom: '8px',
              }}
            >
              Delete Task
            </div>

            <div
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: theme.colors.red[6],
                marginBottom: '4px',
              }}
            >
              Are you sure you want to delete this task?
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {/* Task preview */}
            <div
              style={{
                background: theme.colors.gray[1],
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                border: `2px solid ${theme.colors.gray[3]}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '4px',
                    height: '40px',
                    backgroundColor: theme.colors.red[5],
                    borderRadius: '2px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: theme.colors.dark[7],
                      marginBottom: '8px',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {taskToDelete.title}
                  </div>

                  {taskToDelete.description && (
                    <div
                      style={{
                        fontSize: '14px',
                        color: theme.colors.gray[6],
                        lineHeight: 1.5,
                        maxHeight: '60px',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                      }}
                    >
                      {taskToDelete.description
                        .replace(/<[^>]*>/g, '')
                        .substring(0, 100)}
                      ...
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '8px',
                    }}
                  >
                    <div
                      style={{ fontSize: '12px', color: theme.colors.gray[6] }}
                    >
                      Column:{' '}
                      <strong>
                        {
                          columns.find(
                            (col) => col.id === taskToDelete.columnId,
                          )?.name
                        }
                      </strong>
                    </div>

                    {taskToDelete.priority && (
                      <Badge
                        size="xs"
                        color={
                          taskToDelete.priority === 'highest'
                            ? 'red'
                            : taskToDelete.priority === 'high'
                            ? 'orange'
                            : taskToDelete.priority === 'medium'
                            ? 'blue'
                            : taskToDelete.priority === 'low'
                            ? 'green'
                            : 'gray'
                        }
                        variant="light"
                      >
                        {taskToDelete.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: theme.colors.yellow[0],
                border: `1px solid ${theme.colors.yellow[3]}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: theme.colors.yellow[8],
                  fontWeight: 500,
                }}
              >
                ⚠️ This action cannot be undone. The task will be permanently
                deleted.
              </div>
            </div>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                color="gray"
                size="md"
                onClick={cancelDeleteTask}
                disabled={isDeleting}
                style={{ minWidth: '100px' }}
              >
                Cancel
              </Button>

              <Button
                color="red"
                size="md"
                onClick={confirmDeleteTask}
                loading={isDeleting}
                leftSection={<IconTrash size={18} />}
                style={{ minWidth: '120px' }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: theme.colors.red[7],
                    },
                  },
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Task'}
              </Button>
            </Group>
          </div>
        </Modal>
      )}
    </DndContext>
  );
};
