import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ticketTypeClient, TicketsResponse } from '@/api/ticket-type.client';

export const TICKET_TYPE_QUERY_KEYS = {
  list: 'ticketTypeList',
};

export const useListTicketTypes = (eventId: string) => {
  return useQuery<TicketsResponse, AxiosError>({
    queryKey: [TICKET_TYPE_QUERY_KEYS.list, eventId],
    queryFn: async () => {
      return await ticketTypeClient.list(eventId);
    },
  });
};
