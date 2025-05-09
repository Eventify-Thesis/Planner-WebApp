import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanClient, CreateKanbanTaskDto } from '@/api/kanban.client';
import { GET_KANBAN_TASKS_QUERY_KEY } from '@/queries/useGetKanbanTasks';
import { GET_TASK_ASSIGNMENTS_QUERY_KEY } from '@/queries/useGetTaskAssignments';
import { IdParam } from '@/types/types';
import { showError } from '@/utils/notifications';

export const useCreateKanbanTask = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateKanbanTaskDto) => {
      const newTask = await kanbanClient.createTask(eventId, data);
      return newTask;
    },
    onError: (_err, _data) => {
      // If the mutation fails, roll back
      showError("Failed to create task");
    },
    onSuccess: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId] });
      queryClient.invalidateQueries({ queryKey: [GET_TASK_ASSIGNMENTS_QUERY_KEY, eventId] });
    },
  });
};
