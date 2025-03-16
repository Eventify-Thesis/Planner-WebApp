import { useQuery } from '@tanstack/react-query';
import { eventsClient } from '@/api/event.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const GET_EVENT_BRIEF_QUERY_KEY = 'getEventBrief';

export const useGetEventBrief = (eventId: IdParam) => {
  return useQuery<any, AxiosError>({
    queryKey: [GET_EVENT_BRIEF_QUERY_KEY, eventId],
    queryFn: async () => {
      const data = await eventsClient.getBrief(eventId);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
