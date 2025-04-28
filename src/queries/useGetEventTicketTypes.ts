import { useQuery } from "@tanstack/react-query";
import { eventsClient } from "@/api/event.client.ts";
import { TicketTypeModel } from "@/domain/TicketTypeModel";
import { IdParam } from "@/types/types";

export const GET_EVENT_TICKET_TYPES_QUERY_KEY = 'getEventTicketTypes';

export const useGetEventTicketTypes = (data: { eventId: IdParam }) => {
  return useQuery<TicketTypeModel[]>({
    queryKey: [GET_EVENT_TICKET_TYPES_QUERY_KEY, data.eventId],
    queryFn: async () => await eventsClient.listTickets(data.eventId),
  });
};