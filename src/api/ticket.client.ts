import { TicketModel } from '@/domain/TicketModel';
import { httpApi } from './http.api';

export interface TicketsResponse {
  data: TicketModel[];
}

export const ticketClient = {
  list: async (eventId: string): Promise<TicketsResponse> => {
    const response = await httpApi.get(`/planner/events/${eventId}/tickets`);
    return response.data.data.result;
  },
};
