import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IdParam } from "@/types/types.ts";
import { Message } from "@/types/types.ts";
import { messagesClient } from "@/api/messages.client.ts";

export const useSendEventMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ messageData, eventId }: {
            messageData: Partial<Message>,
            eventId: IdParam,
        }) => messagesClient.send(eventId, messageData as Message),

        onSuccess: (_, variables) => {
            // queryClient.invalidateQueries({
            //     queryKey: [GET_EVENT_MESSAGES_QUERY_KEY, variables.eventId]
            // });
        }
    });
}
