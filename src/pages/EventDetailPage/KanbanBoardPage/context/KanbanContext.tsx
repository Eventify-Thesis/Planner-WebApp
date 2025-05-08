import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  KanbanTask,
  KanbanColumn,
  TaskAssignment,
  TaskLabel,
  TaskPriority,
} from '@/api/kanban.client';

// Import all necessary queries and mutations
import {
  GET_KANBAN_COLUMNS_QUERY_KEY,
  useGetKanbanColumns,
} from '@/queries/useGetKanbanColumns';
import {
  GET_KANBAN_TASKS_QUERY_KEY,
  useGetKanbanTasks,
} from '@/queries/useGetKanbanTasks';
import { useGetTaskAssignments } from '@/queries/useGetTaskAssignments';
import { useUpdateTaskPosition } from '@/mutations/useUpdateTaskPosition';
import { useCreateKanbanTask } from '@/mutations/useCreateKanbanTask';
import { useCreateKanbanColumn } from '@/mutations/useCreateKanbanColumn';
import { useDeleteKanbanColumn } from '@/mutations/useDeleteKanbanColumn';
import { useUpdateKanbanColumn } from '@/mutations/useUpdateKanbanColumn';
import { useCreateKanbanBoard } from '@/mutations/useCreateKanbanBoard';
import { useDeleteKanbanTask } from '@/mutations/useDeleteKanbanTask';

// Define the context type
interface KanbanContextType {
  eventId: number;
  columns: KanbanColumn[];
  tasks: KanbanTask[];
  assignments: TaskAssignment[];
  isLoading: boolean;
  hasError: boolean;
  boardExists: boolean;
  // Tasks state management
  setTasks: (
    tasks: KanbanTask[] | ((prevTasks: KanbanTask[]) => KanbanTask[]),
  ) => void;
  getTasksByColumn: (columnId: number, searchQuery?: string) => KanbanTask[];
  // Actions
  moveTask: (
    taskId: number,
    data: { columnId?: number; position: number },
  ) => void;
  createTask: (data: {
    columnId: number;
    title: string;
    position: number;
    description?: string;
    priority?: TaskPriority;
    labels?: TaskLabel[];
  }) => Promise<KanbanTask>;
  deleteTask: (taskId: number) => Promise<void>;
  createColumn: (data: { name: string; position: number }) => void;
  deleteColumn: (columnId: number) => void;
  moveColumn: (columnId: number, newPosition: number) => void;
  createBoard: () => void;
}

// Create the context with default values
export const KanbanContext = createContext<KanbanContextType>({
  eventId: 0,
  columns: [],
  tasks: [],
  assignments: [],
  isLoading: false,
  hasError: false,
  boardExists: false,
  setTasks: () => {},
  getTasksByColumn: () => [],
  moveTask: () => {},
  createTask: () => Promise.resolve({} as KanbanTask),
  deleteTask: () => Promise.resolve(),
  createColumn: () => {},
  deleteColumn: () => {},
  moveColumn: () => {},
  createBoard: () => {},
});

// Provider props
interface KanbanProviderProps {
  children: ReactNode;
  eventId: string;
}

// Create the provider
export const KanbanProvider: React.FC<KanbanProviderProps> = ({
  children,
  eventId,
}) => {
  const queryClient = useQueryClient();
  const eventIdNum = parseInt(eventId || '0');

  // Use React Query for data fetching
  const {
    data: columns = [],
    isLoading: isLoadingColumns,
    error: columnsError,
  } = useGetKanbanColumns(eventId);

  const {
    data: initialTasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useGetKanbanTasks(eventId);

  // Local state for tasks that syncs with server data
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);

  // Keep tasks in sync with server data
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    error: assignmentsError,
  } = useGetTaskAssignments(eventId);

  // Set up mutations
  const updateTaskPosition = useUpdateTaskPosition(eventIdNum);
  const createTask = useCreateKanbanTask(eventIdNum);
  const createColumn = useCreateKanbanColumn(eventIdNum);
  const deleteColumn = useDeleteKanbanColumn(eventIdNum);
  const moveColumnMutation = useUpdateKanbanColumn(eventIdNum);
  const deleteTaskMutation = useDeleteKanbanTask(eventIdNum);
  const createBoardMutation = useCreateKanbanBoard(eventId);

  // Status indicators
  const isLoading = isLoadingColumns || isLoadingTasks || isLoadingAssignments;
  const hasError = !!columnsError || !!tasksError || !!assignmentsError;
  const boardExists = !isLoading && columns.length > 0;

  // Define optimistic update helpers
  const optimisticallyUpdateTasks = (
    updatedTask: Partial<KanbanTask> & { id: number },
  ) => {
    // Update React Query cache
    queryClient.setQueryData(
      [GET_KANBAN_TASKS_QUERY_KEY, eventId],
      (oldTasks: KanbanTask[] | undefined) => {
        if (!oldTasks) return [];
        return oldTasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
        );
      },
    );

    // Also update our local state
    setTasks((prevTasks: KanbanTask[]) =>
      prevTasks.map((task: KanbanTask) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task,
      ),
    );
  };

  // Helper to get tasks by column with filtering
  const getTasksByColumn = (columnId: number, searchQuery: string = '') => {
    return tasks
      .filter((task) => {
        // First filter by column
        if (task?.columnId !== columnId) return false;

        // Then filter by search query if present
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(query);
          const descMatch = task.description
            ? task.description.toLowerCase().includes(query)
            : false;
          return titleMatch || descMatch;
        }

        // Otherwise return all tasks in this column
        return true;
      })
      .sort((a: KanbanTask, b: KanbanTask) => a.position - b.position);
  };

  // Action implementations with optimistic updates
  const moveTask = (
    taskId: number,
    data: { columnId?: number; position: number },
  ) => {
    // Optimistic update
    const targetTask = tasks.find((t: KanbanTask) => t.id === taskId);
    if (targetTask) {
      optimisticallyUpdateTasks({
        id: taskId,
        ...data,
      });
    }

    // Server update
    updateTaskPosition.mutate(
      { taskId, data },
      {
        onError: () => {
          // Revert on error by invalidating the query to refetch
          queryClient.invalidateQueries({
            queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId],
          });
        },
      },
    );
  };

  const handleCreateTask = async (data: {
    columnId: number;
    title: string;
    position: number;
    description?: string;
    priority?: TaskPriority;
    labels?: TaskLabel[];
  }): Promise<KanbanTask> => {
    // Ensure data matches the expected type
    const newTask = await createTask.mutateAsync({
      columnId: data.columnId,
      title: data.title,
      position: data.position,
      description: data.description,
      priority: data.priority,
      labels: data.labels,
    });

    queryClient.setQueryData(
      [GET_KANBAN_TASKS_QUERY_KEY, eventId],
      (oldTasks: KanbanTask[] | undefined) => {
        if (!oldTasks) return [];
        return [...oldTasks, newTask];
      },
    );
    return newTask;
  };

  const handleCreateColumn = async (data: {
    name: string;
    position: number;
  }) => {
    const newColumn = await createColumn.mutateAsync(data);

    queryClient.setQueryData(
      [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
      (oldColumns: KanbanColumn[] | undefined) => {
        if (!oldColumns) return [];
        return [...oldColumns, newColumn];
      },
    );
  };

  const handleDeleteColumn = async (columnId: number) => {
    await deleteColumn.mutateAsync(columnId);

    if (!deleteColumn.isError) {
      queryClient.setQueryData(
        [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
        (oldColumns: KanbanColumn[] | undefined) => {
          if (!oldColumns) return [];
          return oldColumns.filter((col) => col.id !== columnId);
        },
      );

      queryClient.setQueryData(
        [GET_KANBAN_TASKS_QUERY_KEY, eventId],
        (oldTasks: KanbanTask[] | undefined) => {
          if (!oldTasks) return [];
          return oldTasks.filter((task) => task.columnId !== columnId);
        },
      );
    }
  };

  const handleMoveColumn = (columnId: number, newPosition: number) => {
    // Get the current column
    const columnToMove = columns.find((col) => col.id === columnId);
    if (!columnToMove) return;

    // Optimistic update
    queryClient.setQueryData(
      [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
      (oldColumns: KanbanColumn[] | undefined) => {
        if (!oldColumns) return [];

        // Create a copy of columns and sort by position
        const sortedColumns = [...oldColumns].sort(
          (a, b) => a.position - b.position,
        );

        // Remove the column from its current position
        const filteredColumns = sortedColumns.filter(
          (col) => col.id !== columnId,
        );

        // Insert the column at the new position
        filteredColumns.splice(newPosition, 0, columnToMove);

        // Update positions for all columns
        return filteredColumns.map((col, index) => ({
          ...col,
          position: index,
        }));
      },
    );

    moveColumnMutation.mutate(
      { columnId, data: { position: newPosition } },
      {
        onError: () => {
          queryClient.invalidateQueries({
            queryKey: [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
          });
        },
      },
    );
  };

  const handleDeleteTask = async (taskId: number): Promise<void> => {
    try {
      // Optimistic update - remove task from state before API call completes
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      // Call API to delete task
      await deleteTaskMutation.mutateAsync(taskId);
    } catch (error) {
      // If there's an error, revert the optimistic update
      console.error('Error deleting task:', error);
      queryClient.invalidateQueries({
        queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId],
      });
      throw error;
    }
  };

  const handleCreateBoard = () => {
    createBoardMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
        });
      },
    });
  };

  // Provide the context value
  const value: KanbanContextType = {
    eventId: eventIdNum,
    columns,
    tasks,
    assignments,
    isLoading,
    hasError,
    boardExists,
    setTasks,
    getTasksByColumn,
    moveTask,
    createTask: handleCreateTask,
    deleteTask: handleDeleteTask,
    createColumn: handleCreateColumn,
    deleteColumn: handleDeleteColumn,
    moveColumn: handleMoveColumn,
    createBoard: handleCreateBoard,
  };

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  );
};

// Create a custom hook for using the context
export const useKanban = () => useContext(KanbanContext);
