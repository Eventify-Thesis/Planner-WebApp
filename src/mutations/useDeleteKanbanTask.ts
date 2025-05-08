import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient } from '@/api/kanban.client';
import { GET_KANBAN_TASKS_QUERY_KEY } from '@/queries/useGetKanbanTasks';
import { GET_TASK_ASSIGNMENTS_QUERY_KEY } from '@/queries/useGetTaskAssignments';
import { IdParam } from '@/types/types';

export const useDeleteKanbanTask = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      return await kanbanClient.deleteTask(eventId, taskId);
    },
    onSuccess: () => {
      // Invalidate the queries for tasks and assignments
      queryClient.invalidateQueries({
        queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId],
      });

      queryClient.invalidateQueries({
        queryKey: [GET_TASK_ASSIGNMENTS_QUERY_KEY, eventId],
      });
    },
  });
};
