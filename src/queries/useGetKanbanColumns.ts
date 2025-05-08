import { useQuery } from '@tanstack/react-query';
import { kanbanClient, KanbanColumn } from '@/api/kanban.client';
import { IdParam } from '@/types/types';
import { AxiosError } from 'axios';

export const GET_KANBAN_COLUMNS_QUERY_KEY = 'getKanbanColumns';

export const useGetKanbanColumns = (eventId: IdParam) => {
  return useQuery<KanbanColumn[], AxiosError>({
    queryKey: [GET_KANBAN_COLUMNS_QUERY_KEY, eventId],
    queryFn: async () => {
      const data = await kanbanClient.getColumns(eventId);
      return data;
    },
    refetchOnWindowFocus: 'always',
  });
};
