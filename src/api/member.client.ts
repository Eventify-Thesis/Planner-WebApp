import { MemberModel } from '@/domain/MemberModel';
import { httpApi } from './http.api';
import { IdParam, PaginationResponse, QueryFilters } from '@/types/types';
import { EventRole } from '@/constants/enums/event';

export interface AddMemberParams {
  email: string;
  role: EventRole;
  organizationId: string;
}

export interface UpdateMemberRoleParams {
  role: EventRole;
}

export const memberClient = {
  list: async (
    eventId: IdParam,
    pagination: QueryFilters,
  ): Promise<PaginationResponse<MemberModel>> => {
    const response = await httpApi.get(`/planner/events/${eventId}/members`, {
      params: pagination,
    });
    return response.data.data;
  },

  add: async (
    eventId: IdParam,
    data: AddMemberParams,
  ): Promise<MemberModel> => {
    const response = await httpApi.post(
      `/planner/events/${eventId}/members`,
      data,
    );
    return response.data.result;
  },

  updateRole: async (
    eventId: IdParam,
    userId: IdParam,
    data: UpdateMemberRoleParams,
  ): Promise<MemberModel> => {
    const response = await httpApi.post(
      `/planner/events/${eventId}/members/${userId}/role`,
      data,
    );
    return response.data.result;
  },

  delete: async (eventId: IdParam, userId: IdParam): Promise<void> => {
    await httpApi.delete(`/planner/events/${eventId}/members/${userId}`);
  },
};
