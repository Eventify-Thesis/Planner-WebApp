import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient, UpdateKanbanTaskDto } from '@/api/kanban.client';
import { GET_KANBAN_TASKS_QUERY_KEY } from '@/queries/useGetKanbanTasks';
import { IdParam } from '@/types/types';

interface UpdateTaskParams {
  taskId: number;
  data: UpdateKanbanTaskDto;
}

export const useUpdateKanbanTask = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: UpdateTaskParams) => {
      return await kanbanClient.updateTask(eventId, taskId, data);
    },
    onSuccess: () => {
      // Invalidate the query for tasks
      queryClient.invalidateQueries({
        queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId],
      });
    },
  });
};
