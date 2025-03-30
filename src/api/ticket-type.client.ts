import { TicketTypeModel } from '@/domain/TicketTypeModel';
import { httpApi } from './http.api';

export interface TicketsResponse {
  data: TicketTypeModel[];
}

export const ticketTypeClient = {
  list: async (eventId: string): Promise<TicketsResponse> => {
    const response = await httpApi.get(
      `/planner/events/${eventId}/ticket-types`,
    );
    return response.data.data.result;
  },
};
