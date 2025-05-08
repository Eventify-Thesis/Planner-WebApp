import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient, UpdateTaskAssignmentsDto } from '@/api/kanban.client';
import { GET_TASK_ASSIGNMENTS_QUERY_KEY } from '@/queries/useGetTaskAssignments';
import { IdParam } from '@/types/types';

interface UpdateTaskAssignmentsParams {
  taskId: number;
  data: UpdateTaskAssignmentsDto;
}

export const useUpdateTaskAssignments = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: UpdateTaskAssignmentsParams) => {
      return await kanbanClient.updateTaskAssignments(eventId, taskId, data);
    },
    onSuccess: () => {
      // Invalidate the query for assignments
      queryClient.invalidateQueries({
        queryKey: [GET_TASK_ASSIGNMENTS_QUERY_KEY, eventId],
      });
    },
  });
};
