import { useQuery } from '@tanstack/react-query';
import { eventsClient } from '@/api/event.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const GET_EVENT_SHOW_QUERY_KEY = 'getEventShow';

export const useGetEventShow = (eventId: IdParam) => {
  return useQuery<any, AxiosError>({
    queryKey: [GET_EVENT_SHOW_QUERY_KEY, eventId],
    queryFn: async () => {
      const data = await eventsClient.getShow(eventId);
      return data;
    },
    staleTime: 5,
  });
};
