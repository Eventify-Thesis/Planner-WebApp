import { AxiosResponse } from 'axios';
import { EventRole } from '../components/event/EventMembers/types';
import { MemberModel } from '@/domain/MemberModel';
import { httpApi } from '@/api/http.api';

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
  docs: MemberModel[];
}

export interface AddMemberDto {
  email: string;
  role: EventRole;
  organizationId: string;
}

export interface UpdateMemberRoleDto {
  role: EventRole;
}

export interface MemberListQueryModel {
  page: number;
  limit: number;
  search: string | null;
  role: string | null;
}

export const listMembersAPI = async (
  eventId: string,
  getMemberListReq: MemberListQueryModel,
): Promise<PaginationResponse> => {
  const response = await httpApi.get<any>(
    `/planner/events/${eventId}/members`,
    {
      params: getMemberListReq,
    },
  );
  return response.data.data;
};

export const addMemberAPI = async (
  eventId: string,
  data: AddMemberDto,
): Promise<MemberModel> => {
  const response = await httpApi.post<any>(
    `/planner/events/${eventId}/members`,
    data,
  );
  return response.data.data;
};

export const updateMemberRoleAPI = async (
  eventId: string,
  userId: string,
  data: UpdateMemberRoleDto,
): Promise<AxiosResponse<{ status: string }>> => {
  const response = await httpApi.post<any>(
    `/planner/events/${eventId}/members/${userId}/role`,
    data,
  );
  return response.data.data;
};

export const deleteMemberAPI = async (
  eventId: string,
  userId: string,
): Promise<AxiosResponse<{ status: string }>> => {
  const response = await httpApi.delete<any>(
    `/planner/events/${eventId}/members/${userId}`,
  );

  return response.data;
};
