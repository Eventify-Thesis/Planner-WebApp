import { httpApi } from './http.api';

export interface SeatCategoryMapping {
  id: string;
  seatingPlanId: string;
  eventId: string;
  showId: string;
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
  getByShowId: (eventId: string, showId: string) => {
    return httpApi
      .get<any>(
        `/planner/events/${eventId}/shows/${showId}/seat-category-mappings`,
      )
      .then((response) => response.data.data.result);
  },

  batchCreate: (
    eventId: string,
    showId: string,
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
    eventId: string,
    showId: string,
    dto: BatchUpdateSeatCategoryMappingDto,
  ) => {
    return httpApi
      .put<SeatCategoryMapping[]>(
        `/planner/events/${eventId}/shows/${showId}/seat-category-mappings`,
        dto,
      )
      .then((response) => response.data);
  },

  deleteByShowId: (eventId: string, showId: string) => {
    return httpApi.delete(
      `/planner/events/${eventId}/shows/${showId}/seat-category-mappings`,
    );
  },
};
