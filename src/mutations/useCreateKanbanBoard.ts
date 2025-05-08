import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient } from '@/api/kanban.client';
import { GET_KANBAN_COLUMNS_QUERY_KEY } from '@/queries/useGetKanbanColumns';
import { GET_KANBAN_TASKS_QUERY_KEY } from '@/queries/useGetKanbanTasks';
import { IdParam } from '@/types/types';

export const useCreateKanbanBoard = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await kanbanClient.createBoard(eventId);
    },
    onSuccess: () => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
      });
      
      queryClient.invalidateQueries({
        queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId],
      });
    },
  });
};
