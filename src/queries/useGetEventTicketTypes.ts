import { useQuery } from "@tanstack/react-query";
import { eventsClient } from "@/api/event.client.ts";
import { TicketTypeModel } from "@/domain/TicketTypeModel";
import { IdParam } from "@/types/types";

export const GET_EVENT_TICKET_TYPES_QUERY_KEY = 'getEventTicketTypes';

export const useGetEventTicketTypes = (eventId: IdParam, showId?: number) => {
  return useQuery<TicketTypeModel[]>({
    queryKey: [GET_EVENT_TICKET_TYPES_QUERY_KEY, eventId, showId],
    queryFn: async () => {
      if (showId) {
        return await eventsClient.listTicketsByShow(eventId, showId);
      }
      return await eventsClient.listTickets(eventId);
    },
    enabled: !!eventId,
  });
};