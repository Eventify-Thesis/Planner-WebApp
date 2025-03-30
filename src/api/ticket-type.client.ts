import { TicketTypeModel } from '@/domain/TicketTypeModel';
import { httpApi } from './http.api';
import { IdParam } from '@/types/types';

export const ticketTypeClient = {
  list: async (eventId: IdParam): Promise<TicketTypeModel[]> => {
    const response = await httpApi.get(
      `/planner/events/${eventId}/ticket-types`,
    );
    return response.data.data.result;
  },

  listAllOfShow: async (
    eventId: IdParam,
    showId: IdParam,
  ): Promise<TicketTypeModel[]> => {
    const response = await httpApi.get(
      `/planner/events/${eventId}/shows/${showId}/ticket-types`,
    );
    return response.data.data.result;
  },
};
