import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient } from '@/api/kanban.client';
import { GET_KANBAN_COLUMNS_QUERY_KEY } from '@/queries/useGetKanbanColumns';
import { GET_KANBAN_TASKS_QUERY_KEY } from '@/queries/useGetKanbanTasks';

export const useDeleteKanbanColumn = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: number) => kanbanClient.deleteColumn(eventId, columnId),
    onMutate: async (columnId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: [GET_KANBAN_COLUMNS_QUERY_KEY, eventId] });
      await queryClient.cancelQueries({ queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId] });

      // Snapshot the previous value
      const previousColumns = queryClient.getQueryData([GET_KANBAN_COLUMNS_QUERY_KEY, eventId]);

      // Optimistically update the UI by removing the deleted column
      queryClient.setQueryData([GET_KANBAN_COLUMNS_QUERY_KEY, eventId], (old: any[]) => {
        return old ? old.filter(col => col.id !== columnId) : [];
      });

      // Also remove tasks associated with this column
      queryClient.setQueryData([GET_KANBAN_TASKS_QUERY_KEY, eventId], (old: any[]) => {
        return old ? old.filter(task => task.columnId !== columnId) : [];
      });

      return { previousColumns };
    },
    onError: (_err, _columnId, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousColumns) {
        queryClient.setQueryData(
          [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
          context.previousColumns
        );
      }
    },
    onSuccess: () => {
      // Always refetch after error or success to ensure the server state
      queryClient.invalidateQueries({ queryKey: [GET_KANBAN_COLUMNS_QUERY_KEY, eventId] });
      queryClient.invalidateQueries({ queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId] });
    },
  });
};

// Default export for better module resolution
export default useDeleteKanbanColumn;
