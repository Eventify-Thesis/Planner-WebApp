import { EventModel } from '@/domain/EventModel';
import { IdParam } from '@/types/types';
import { EventRole, EventType } from '@/constants/enums/event';
import { httpApi } from './http.api';

export interface PaginationResponse<T> {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
  docs: T[];
}

export interface EventListQueryModel {
  page: number;
  limit: number;
  keyword: string | null;
  status: string | null;
}

export interface CreateDraftEventDto {
  id?: number;
  eventLogoUrl: string;
  eventBannerUrl: string;
  eventName: string;
  categories: string[];
  eventDescription: string;
  orgLogoUrl: string;
  orgName: string;
  orgDescription: string;
  venueName: string;
  cityId: number;
  districtId: number;
  wardId: number;
  street: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  placeId?: string;
  categoriesIds: number[];
  eventType: EventType;
}

export interface EventBriefResponse {
  id: number;
  eventName: string;
  eventLogoUrl: string;
  eventBannerUrl: string;
  organizationId: string;
  role: EventRole;
}

export const eventsClient = {
  getAll: async (): Promise<any> => {
    try {
      const response = await httpApi.get<any>('/planner/events');
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getList: async (
    query: EventListQueryModel,
  ): Promise<PaginationResponse<EventModel>> => {
    try {
      const response = await httpApi.get<any>('/planner/events', {
        params: query,
      });
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  saveDraft: async (data: CreateDraftEventDto): Promise<EventModel> => {
    try {
      const response = await httpApi.post<any>('/planner/events/draft', data);
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  create: async (event: Partial<EventModel>): Promise<EventModel> => {
    try {
      const response = await httpApi.post<any>('/planner/events', event);
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getDetail: async (id: IdParam): Promise<EventModel> => {
    try {
      const response = await httpApi.get<any>(`/planner/events/${id}`);
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  update: async (
    eventId: IdParam,
    event: Partial<EventModel>,
  ): Promise<EventModel> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}`,
        event,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  delete: async (eventId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.delete<any>(`/planner/events/${eventId}`);
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  updateEventStatus: async (
    eventId: IdParam,
    status: string,
  ): Promise<EventModel> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}/status`,
        {
          status,
        },
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  updateShow: async (eventId: IdParam, showData: any): Promise<any> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}/shows`,
        showData,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  updateSetting: async (eventId: IdParam, settingData: any): Promise<any> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}/settings`,
        settingData,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  updatePayment: async (eventId: IdParam, paymentData: any): Promise<any> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}/payment-info`,
        paymentData,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getListShows: async (eventId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/shows`,
      );
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getSetting: async (eventId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/settings`,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getPayment: async (eventId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/payment-info`,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getBrief: async (eventId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/brief`,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  listTickets: async (eventId: IdParam): Promise<any[]> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/ticket-types`,
      );
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  listTicketsByShow: async (
    eventId: IdParam,
    showId: number,
  ): Promise<any[]> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/shows/${showId}/ticket-types`,
      );
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  createDraft: async (data: any): Promise<any> => {
    try {
      const response = await httpApi.post<any>('/planner/events/draft', data);
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getEventStats: async (
    eventId: IdParam,
    options?: { startDate?: string; endDate?: string },
  ) => {
    const params: any = {};
    if (options?.startDate) params.startDate = options.startDate;
    if (options?.endDate) params.endDate = options.endDate;

    const response = await httpApi.get<any>(
      'planner/events/' + eventId + '/stats',
      { params },
    );
    return response.data.data;
  },
};
