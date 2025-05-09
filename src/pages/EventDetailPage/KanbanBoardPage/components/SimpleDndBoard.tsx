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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch, IconFilter, IconX } from '@tabler/icons-react';

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

  // Drag and drop state
  const [isDraggingOver, setIsDraggingOver] = useState<number | null>(null);

  // No longer need to sync with server data - the context handles this

  // Configure sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 5 pixels before activating
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with 5px tolerance
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  // Get task assignments
  const getAssignmentsByTask = (taskId: number) => {
    return assignments.filter((assignment) => assignment.taskId === taskId);
  };

  // Use the column tasks with search filtering
  const getFilteredTasksByColumn = (columnId: number) => {
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

  // Handle task deletion
  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onTaskDelete(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
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
        {/* Search and filter toolbar */}
        <div className="kanban-toolbar">
          <div className="search-input-wrapper">
            <IconSearch
              size={16}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                color: theme.colors.gray[6],
                zIndex: 1,
              }}
            />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              styles={{ input: { paddingLeft: '36px' } }}
              rightSection={
                searchQuery ? (
                  <ActionIcon
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    variant="subtle"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                ) : null
              }
              ref={searchInputRef}
            />
          </div>

          <div className="filter-wrapper">
            <IconFilter
              size={16}
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1,
                color: theme.colors.gray[6],
              }}
            />
            <Select
              placeholder="Filter by column"
              value={filterColumn}
              onChange={setFilterColumn}
              clearable
              data={[
                { value: '', label: 'All Columns' },
                ...columns.map((col) => ({
                  value: col.id.toString(),
                  label: col.name,
                })),
              ]}
              styles={{ input: { paddingLeft: '36px' } }}
            />
          </div>
        </div>

        <div className="board-columns-wrapper">
          <div className="kanban-columns-container">
            {columns.map((column) => {
              const columnTasks = getFilteredTasksByColumn(column.id);
              const isHighlighted = isDraggingOver === column.id;

              // Create available columns data for dropdown
              const availableColumns = columns.map((col) => ({
                value: col.id.toString(),
                label: col.name,
              }));

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
                  onUpdateColumn={(columnId, name) => onColumnUpdate(columnId, { name })}
                />
              );
            })}

            {/* Add column button */}
            <div className="add-column-button">
              <Button
                leftSection={<IconPlus size={16} />}
                variant="outline"
                onClick={openAddColumnModal}
                color="blue"
                size="sm"
              >
                Add Column
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay for visual feedback */}
      <DragOverlay adjustScale style={{ transformOrigin: '0 0 ' }}>
        {activeTask && (
          <div className="task-drag-overlay">
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

      {/* Add Column Modal */}
      <Modal
        opened={isAddColumnModalOpen}
        onClose={closeAddColumnModal}
        title="Add New Column"
        size="sm"
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
            placeholder="Enter column name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            required
            mb="md"
            autoFocus
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeAddColumnModal}>
              Cancel
            </Button>
            <Button type="submit">Add Column</Button>
          </Group>
        </Box>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        opened={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        title="Add New Task"
        size="sm"
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
            placeholder="Enter task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            mb="md"
            autoFocus
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeAddTaskModal}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </Group>
        </Box>
      </Modal>
    </DndContext>
  );
};
