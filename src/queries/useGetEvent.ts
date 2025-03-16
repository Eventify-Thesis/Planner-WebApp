import { useQuery } from '@tanstack/react-query';
import { eventsClient, EventBriefResponse } from '@/api/event.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const GET_EVENT_QUERY_KEY = 'getEvent';

export const useGetEvent = (eventId: IdParam) => {
  return useQuery<EventBriefResponse, AxiosError>({
    queryKey: [GET_EVENT_QUERY_KEY, eventId],
    queryFn: async () => {
      const data = await eventsClient.getBrief(eventId);
      return data;
    },
    staleTime: 5,
  });
};
