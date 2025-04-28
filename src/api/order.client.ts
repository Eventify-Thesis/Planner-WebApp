import { httpApi } from './http.api';
import { IdParam, PaginationResponse, QueryFilters } from '@/types/types';
import { OrderModel } from '@/domain/OrderModel';

export const orderClient = {
    list: async (eventId: IdParam, pagination: QueryFilters): Promise<PaginationResponse<OrderModel>> => {
        const response = await httpApi.get(`/planner/events/${eventId}/orders/list`, {
            params: pagination,
        });
        return response.data.data;
    },

    getDetail: async (eventId: IdParam, orderId: IdParam): Promise<OrderModel> => {
        const response = await httpApi.get(`/planner/events/${eventId}/orders/${orderId}`);
        return response.data.data;
    },

    cancel: async (eventId: IdParam, orderId: IdParam) => {
        const response = await httpApi.post(`/planner/events/${eventId}/orders/${orderId}/cancel`);
        return response.data;
    },

    exportOrders: async (eventId: IdParam): Promise<Blob> => {
        const response = await httpApi.post(`planner/events/${eventId}/orders/export`, {}, {
            responseType: 'blob',
        });

        return new Blob([response.data]);
    },


    resendConfirmation: async (eventId: IdParam, orderId: IdParam) => {
        const response = await httpApi.post<any>('planner/events/' + eventId + '/orders/' + orderId + '/resend-confirmation');
        return response.data;
    },
};
