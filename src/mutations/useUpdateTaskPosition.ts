import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient, UpdateTaskPositionDto } from '@/api/kanban.client';
import { GET_KANBAN_TASKS_QUERY_KEY } from '@/queries/useGetKanbanTasks';
import { IdParam } from '@/types/types';

interface UpdateTaskPositionParams {
  taskId: number;
  data: UpdateTaskPositionDto;
}

export const useUpdateTaskPosition = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: UpdateTaskPositionParams) => {
      return await kanbanClient.updateTaskPosition(eventId, taskId, data);
    },
    onSuccess: () => {
      // Invalidate the query for tasks
      queryClient.invalidateQueries({
        queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId],
      });
    },
  });
};
