import { useQuery } from '@tanstack/react-query';
import { eventsClient } from '@/api/event.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const GET_EVENT_SETTING_QUERY_KEY = 'getEventSetting';

export const useGetEventSetting = (eventId: IdParam | undefined) => {
  return useQuery<any, AxiosError>({
    queryKey: [GET_EVENT_SETTING_QUERY_KEY, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const data = await eventsClient.getSetting(eventId);
      return data;
    },
    enabled: !!eventId,
  });
};
