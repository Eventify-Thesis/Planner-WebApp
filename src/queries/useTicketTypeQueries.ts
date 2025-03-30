import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ticketTypeClient } from '@/api/ticket-type.client';
import { IdParam } from '@/types/types';
import { TicketTypeModel } from '@/domain/TicketTypeModel';

export const TICKET_TYPE_QUERY_KEYS = {
  list: 'ticketTypeList',
  listAllOfShow: 'ticketTypeListAllOfShow',
};

export const useListTicketTypes = (eventId: IdParam) => {
  return useQuery<TicketTypeModel[], AxiosError>({
    queryKey: [TICKET_TYPE_QUERY_KEYS.list, eventId],
    queryFn: async () => {
      return await ticketTypeClient.list(eventId);
    },
  });
};

export const useListTicketTypesOfShow = (
  eventId: IdParam,
  showId: IdParam,
  options?: Omit<
    UseQueryOptions<TicketTypeModel[], AxiosError>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery<TicketTypeModel[], AxiosError>({
    queryKey: [TICKET_TYPE_QUERY_KEYS.listAllOfShow, eventId, showId],
    queryFn: async () => {
      return await ticketTypeClient.listAllOfShow(eventId, showId);
    },
    ...options,
  });
};
