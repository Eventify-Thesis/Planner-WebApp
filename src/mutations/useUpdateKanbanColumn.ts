import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient } from '@/api/kanban.client';
import { GET_KANBAN_COLUMNS_QUERY_KEY } from '@/queries/useGetKanbanColumns';
import { GET_KANBAN_TASKS_QUERY_KEY } from '@/queries/useGetKanbanTasks';

interface UpdateColumnParams {
  columnId: number;
  data: {
    name?: string;
    position?: number;
  };
}

export const useUpdateKanbanColumn = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, data }: UpdateColumnParams) =>
      kanbanClient.updateColumn(eventId, columnId, data),
    onSuccess: () => {
      // Invalidate the columns query to refetch
      queryClient.invalidateQueries({
        queryKey: [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
        refetchType: 'active',
        exact: false,
      });

      // Also invalidate tasks query as column changes can affect task display
      queryClient.invalidateQueries({
        queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId],
        refetchType: 'active',
        exact: false,
      });
    },
  });
};

// Default export for better module resolution
export default useUpdateKanbanColumn;
