import { ShowingModel, ShowModel } from '@/domain/ShowModel';
import { httpApi } from './http.api';
import { IdParam } from '@/types/types';

export const showClient = {
  list: async (eventId: IdParam): Promise<ShowModel> => {
    const response = await httpApi.get(`planner/events/${eventId}/shows`);
    return response.data.data.result;
  },

  get: async (eventId: IdParam, showId: IdParam): Promise<ShowingModel> => {
    const response = await httpApi.get(
      `planner/events/${eventId}/shows/${showId}`,
    );
    return response.data.result;
  },

  create: async (
    eventId: IdParam,
    data: ShowingModel,
  ): Promise<ShowingModel> => {
    const response = await httpApi.post(
      `planner/events/${eventId}/shows`,
      data,
    );
    return response.data.result;
  },

  update: async (
    eventId: IdParam,
    showId: IdParam,
    data: ShowingModel,
  ): Promise<ShowingModel> => {
    const response = await httpApi.put(
      `planner/events/${eventId}/shows/${showId}`,
      data,
    );
    return response.data.result;
  },

  delete: async (eventId: IdParam, showId: IdParam): Promise<void> => {
    await httpApi.delete(`planner/events/${eventId}/shows/${showId}`);
  },
};
