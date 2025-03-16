import { httpApi } from '@/api/http.api';
import {
  VoucherModel,
  VoucherCodeType,
  VoucherDiscountType,
  VoucherStatus,
  CreateVoucherDto,
  UpdateVoucherDto,
} from '@/domain/VoucherModel';
import { IdParam, PaginationResponse, QueryFilters } from '@/types/types';

// API endpoints for React Query usage
export const vouchersClient = {
  getList: async (
    eventId: IdParam,
    query: QueryFilters,
  ): Promise<PaginationResponse<VoucherModel>> => {
    const response = await httpApi.get<any>(
      `/planner/events/${eventId}/vouchers`,
      {
        params: query,
      },
    );
    return response.data.data;
  },

  getDetail: async (eventId: IdParam, id: IdParam): Promise<VoucherModel> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/vouchers/${id}`,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  create: async (
    eventId: IdParam,
    data: CreateVoucherDto,
  ): Promise<VoucherModel> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/vouchers`,
        data,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  update: async (
    eventId: IdParam,
    id: IdParam,
    data: UpdateVoucherDto,
  ): Promise<VoucherModel> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}/vouchers/${id}`,
        data,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  delete: async (eventId: IdParam, id: IdParam): Promise<void> => {
    try {
      await httpApi.delete<any>(`/planner/events/${eventId}/vouchers/${id}`);
    } catch (e: any) {
      throw new Error(e);
    }
  },

  updateActive: async (
    eventId: IdParam,
    id: IdParam,
    active: boolean,
  ): Promise<VoucherModel> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/vouchers/${id}/status`,
        { active },
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },
};
