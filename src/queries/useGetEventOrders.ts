import { useQuery } from "@tanstack/react-query";
import { orderClient } from "../api/order.client.ts";
import { IdParam, PaginationResponse, QueryFilters } from "@/types/types.ts";
import { OrderModel } from "@/domain/OrderModel.ts";

export const GET_EVENT_ORDERS_QUERY_KEY = 'getEventOrders';

export const useGetEventOrders = (data: { eventId: IdParam, pagination: QueryFilters }) => {
  return useQuery<PaginationResponse<OrderModel>>({
    queryKey: [GET_EVENT_ORDERS_QUERY_KEY, data.eventId, data.pagination],
    queryFn: async () => await orderClient.list(data.eventId, data.pagination),
  });
};