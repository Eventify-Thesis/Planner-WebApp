import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient, CreateKanbanColumnDto } from '@/api/kanban.client';
import { GET_KANBAN_COLUMNS_QUERY_KEY } from '@/queries/useGetKanbanColumns';
import { IdParam } from '@/types/types';

export const useCreateKanbanColumn = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateKanbanColumnDto) => {
      return await kanbanClient.createColumn(eventId, data);
    },
    onError: (_err, _data) => {
      // If the mutation fails, roll back to the previous value
    },
    onSuccess: () => {
      console.log('Column created successfully');
      queryClient.invalidateQueries({ queryKey: [GET_KANBAN_COLUMNS_QUERY_KEY, eventId] });
    },
  });
};
