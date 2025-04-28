import { useQuery } from "@tanstack/react-query";
import { orderClient } from "../api/order.client.ts";
import { IdParam } from "@/types/types.ts";
import { OrderModel } from "@/domain/OrderModel.ts";

export const GET_ORDER_QUERY_KEY = 'getEventOrder';

export const useGetOrder = (eventId: IdParam, orderId: IdParam) => {
  return useQuery<OrderModel>({
    queryKey: [GET_ORDER_QUERY_KEY, orderId],

    queryFn: async () => {
      const data = await orderClient.getDetail(Number(eventId), Number(orderId));
      return data;
    },

    enabled: !!eventId && !!orderId
  });
}
