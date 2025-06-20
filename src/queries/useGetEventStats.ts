import { useQuery } from '@tanstack/react-query';
import { IdParam } from '@/types/types.ts';
import { eventsClient } from '../api/event.client.ts';

export const GET_EVENT_STATS_QUERY_KEY = 'getEventStats';

interface UseGetEventStatsOptions {
  startDate?: string;
  endDate?: string;
}

export const useGetEventStats = (
  eventId: IdParam,
  options?: UseGetEventStatsOptions,
) => {
  return useQuery({
    queryKey: [
      GET_EVENT_STATS_QUERY_KEY,
      eventId,
      options?.startDate,
      options?.endDate,
    ],

    queryFn: async () => {
      const data = await eventsClient.getEventStats(eventId, options);
      return data;
    },
  });
};
