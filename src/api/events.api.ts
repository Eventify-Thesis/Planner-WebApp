import { httpApi } from '@/api/http.api';
import { EventStatus } from '@/constants/enums/event';
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
