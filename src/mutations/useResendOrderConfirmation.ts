import { useMutation } from "@tanstack/react-query";
import { orderClient } from "../api/order.client.ts";
import { IdParam } from "@/types/types.ts";

export const useResendOrderConfirmation = () => {
    return useMutation({
        mutationFn: ({ eventId, orderId }: {
            eventId: IdParam,
            orderId: IdParam,
        }) => orderClient.resendConfirmation(eventId, orderId)
    });
}