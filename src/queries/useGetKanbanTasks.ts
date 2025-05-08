import { useQuery } from '@tanstack/react-query';
import { kanbanClient, KanbanTask } from '@/api/kanban.client';
import { IdParam } from '@/types/types';
import { AxiosError } from 'axios';

export const GET_KANBAN_TASKS_QUERY_KEY = 'getKanbanTasks';

export const useGetKanbanTasks = (eventId: IdParam) => {
  return useQuery<KanbanTask[], AxiosError>({
    queryKey: [GET_KANBAN_TASKS_QUERY_KEY, eventId],
    queryFn: async () => {
      const data = await kanbanClient.getTasks(eventId);

      return data;
    },
    staleTime: 5,
    refetchOnWindowFocus: true,
  });
};
