import { useQuery } from '@tanstack/react-query';
import { kanbanClient, TaskAssignment } from '@/api/kanban.client';
import { IdParam } from '@/types/types';
import { AxiosError } from 'axios';

export const GET_TASK_ASSIGNMENTS_QUERY_KEY = 'getTaskAssignments';

export const useGetTaskAssignments = (eventId: IdParam) => {
  return useQuery<TaskAssignment[], AxiosError>({
    queryKey: [GET_TASK_ASSIGNMENTS_QUERY_KEY, eventId],
    queryFn: async () => {
      const data = await kanbanClient.getAssignments(eventId);
      return data;
    },
    staleTime: 30000, // 30 seconds
  });
};
