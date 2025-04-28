import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderClient } from "../api/order.client.ts";
import { GET_ORDER_QUERY_KEY } from "../queries/useGetOrder.ts";
import { GET_EVENT_ORDERS_QUERY_KEY } from "../queries/useGetEventOrders.ts";
import { IdParam } from "@/types/types.ts";

export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ eventId, orderId }: {
            eventId: IdParam,
            orderId: IdParam,
        }) => orderClient.cancel(eventId, orderId),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [GET_ORDER_QUERY_KEY, variables.orderId]
            });
            queryClient.invalidateQueries({
                queryKey: [GET_EVENT_ORDERS_QUERY_KEY, variables.eventId]
            });
        }
    });
}