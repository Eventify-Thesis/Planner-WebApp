import { httpApi } from '@/api/http.api';
import { EventStatus, EventType } from '@/constants/enums/event';
import { EventModel } from '@/domain/EventModel';
import { QueryModel } from '@/domain/QueryModel';
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
