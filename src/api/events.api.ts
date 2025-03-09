import { httpApi } from '@/api/http.api';
import { EventRole, EventType } from '@/constants/enums/event';
import { EventModel } from '@/domain/EventModel';
import { PaymentModel } from '@/domain/PaymentModel';
import { SettingModel } from '@/domain/SettingModel';
import { ShowModel } from '@/domain/ShowModel';
import { TicketModel } from '@/domain/TicketModel';
import { EventListAllResponse } from '@/dto/event-doc.dto';

export interface PaginationResponse {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
  docs: EventListAllResponse[];
}

export interface EventListQueryModel {
  page: number;
  limit: number;
  keyword: string | null;
  status: string | null;
}

export const getEventListAllAPI = async (
  getEventListReq: EventListQueryModel,
): Promise<PaginationResponse | undefined> => {
  try {
    const response = await httpApi.get<any>('/planner/events', {
      params: getEventListReq,
    });

    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

// API for creating a new draft event

export interface CreateDraftEventDto {
  id?: string; // Optional MongoDB ID
  eventLogoURL: string;
  eventBannerURL: string;
  eventName: string;
  categories: string[];
  eventDescription: string;
  orgLogoURL: string;
  orgName: string;
  orgDescription: string;
  venueName: string;
  cityId: number;
  districtId: number;
  wardId: number;
  street: string;
  categoriesIds: number[];
  eventType: EventType;
}

export interface EventBriefResponse {
  id: string;

  eventName: string;

  eventLogoURL: string;

  eventBannerURL: string;

  organizationId: string;

  role: EventRole;
}

export const saveEventDraftAPI = async (
  data: CreateDraftEventDto,
): Promise<EventModel> => {
  try {
    const response = await httpApi.post<any>('/planner/events/draft', data);
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getDetailEventAPI = async (id: string): Promise<EventModel> => {
  try {
    const response = await httpApi.get<any>(`/planner/events/${id}`);
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const updateEventShowAPI = async (
  eventId: string,
  show: ShowModel,
): Promise<ShowModel> => {
  try {
    const response = await httpApi.put<any>(
      `/planner/events/${eventId}/shows`,
      show,
    );
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const updateEventSettingAPI = async (
  eventId: string,
  setting: SettingModel,
): Promise<SettingModel> => {
  try {
    const response = await httpApi.put<any>(
      `/planner/events/${eventId}/settings`,
      setting,
    );
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getEventShowAPI = async (eventId: string): Promise<ShowModel> => {
  try {
    const response = await httpApi.get<any>(`/planner/events/${eventId}/shows`);
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getEventSettingAPI = async (
  eventId: string,
): Promise<SettingModel> => {
  try {
    const response = await httpApi.get<any>(
      `/planner/events/${eventId}/settings`,
    );
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const updateEventPaymentAPI = async (
  eventId: string,
  payment: PaymentModel,
): Promise<PaymentModel> => {
  try {
    const response = await httpApi.put<any>(
      `/planner/events/${eventId}/payment-info`,
      payment,
    );
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getEventPaymentAPI = async (
  eventId: string,
): Promise<PaymentModel> => {
  try {
    const response = await httpApi.get<any>(
      `/planner/events/${eventId}/payment-info`,
    );
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getEventBriefAPI = async (
  eventId: string,
): Promise<EventBriefResponse> => {
  try {
    const response = await httpApi.get<any>(`/planner/events/${eventId}/brief`);
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const listTicketsAPI = async (
  eventId: string,
): Promise<TicketModel[]> => {
  try {
    const response = await httpApi.get<any>(
      `/planner/events/${eventId}/tickets`,
    );
    return response.data.data.result;
  } catch (e: any) {
    throw new Error(e);
  }
};
