import { SeatingPlanModel } from '@/domain/SeatingPlanModel';
import { IdParam, PaginationResponse } from '@/types/types';
import { httpApi } from './http.api';
import { EventModel } from '@/domain/EventModel';

export interface SeatingPlanListQueryModel {
  page: number;
  limit: number;
  keyword: string | null;
}

export interface CreateSeatingPlanDto {
  name: string;
  description: string;
  plan: JSON;
}

export const seatingPlanClient = {
  getList: async (
    eventId: IdParam,
    query: SeatingPlanListQueryModel,
  ): Promise<PaginationResponse<SeatingPlanModel>> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/seating-plan`,
        {
          params: query,
        },
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  create: async (
    eventId: IdParam,
    data: CreateSeatingPlanDto,
  ): Promise<SeatingPlanModel> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/seating-plan`,
        data,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getDetail: async (
    eventId: string,
    id: IdParam,
  ): Promise<SeatingPlanModel> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/seating-plan/${id}`,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  update: async (
    eventId: IdParam,
    seatingPlan: Partial<SeatingPlanModel>,
  ): Promise<SeatingPlanModel> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}/seating-plan`,
        seatingPlan,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  delete: async (eventId: IdParam, id: IdParam): Promise<any> => {
    try {
      const response = await httpApi.delete<any>(
        `/planner/events/${eventId}/seating-plan/${id}`,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },
};
