import { IdParam } from '@/types/types';
import { httpApi } from './http.api';

export interface SeatCategoryMapping {
  id: string;
  seatingPlanId: string;
  eventId: number;
  showId: number;
  category: string;
  ticketTypeId: string;
}

export interface BatchCreateSeatCategoryMappingDto {
  mappings: Omit<SeatCategoryMapping, 'id'>[];
}

export interface BatchUpdateSeatCategoryMappingDto {
  mappings: SeatCategoryMapping[];
}

export const seatCategoryMappingClient = {
  getByShowId: (eventId: number, showId: number) => {
    return httpApi
      .get<any>(
        `/planner/events/${eventId}/shows/${showId}/seat-category-mappings`,
      )
      .then((response) => response.data.data.result);
  },

  batchCreate: (
    eventId: number,
    showId: number,
    dto: BatchCreateSeatCategoryMappingDto,
  ) => {
    return httpApi
      .post<SeatCategoryMapping[]>(
        `/planner/events/${eventId}/shows/${showId}/seat-category-mappings`,
        dto,
      )
      .then((response) => response.data);
  },

  batchUpdate: (
    eventId: number,
    showId: number,
    dto: BatchUpdateSeatCategoryMappingDto,
  ) => {
    return httpApi
      .put<SeatCategoryMapping[]>(
        `/planner/events/${eventId}/shows/${showId}/seat-category-mappings`,
        dto,
      )
      .then((response) => response.data);
  },

  deleteByShowId: (eventId: number, showId: number) => {
    return httpApi.delete(
      `/planner/events/${eventId}/shows/${showId}/seat-category-mappings`,
    );
  },

  lock: (eventId: IdParam, showId: IdParam, id: IdParam, locked: boolean) => {
    return httpApi.post(
      `/planner/events/${eventId}/shows/${showId}/seat-category-mappings/${id}/lock`,
      { locked },
    );
  },
};
