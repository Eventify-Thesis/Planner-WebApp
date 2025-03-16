import { useQuery } from '@tanstack/react-query';
import { eventsClient } from '@/api/event.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const GET_EVENT_PAYMENT_QUERY_KEY = 'getEventPayment';

export const useGetEventPayment = (eventId: IdParam | undefined) => {
  return useQuery<any, AxiosError>({
    queryKey: [GET_EVENT_PAYMENT_QUERY_KEY, eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const data = await eventsClient.getPayment(eventId);
      return data;
    },
    enabled: !!eventId,
  });
};
