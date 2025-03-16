import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ticketClient, TicketsResponse } from '@/api/ticket.client';

export const TICKET_QUERY_KEYS = {
  list: 'ticketList',
};

export const useListTickets = (eventId: string) => {
  return useQuery<TicketsResponse, AxiosError>({
    queryKey: [TICKET_QUERY_KEYS.list, eventId],
    queryFn: async () => {
      return await ticketClient.list(eventId);
    },
  });
};
