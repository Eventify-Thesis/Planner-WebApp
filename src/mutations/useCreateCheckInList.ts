import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IdParam } from "@/types/types.ts";
import { GET_EVENT_CHECK_IN_LISTS_QUERY_KEY } from "@/queries/useGetCheckInLists.ts";
import { checkInListClient } from "@/api/check-in-list.client.ts";
import { CheckInListRequest } from "@/domain/CheckInListModel";

export const useCreateCheckInList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ checkInListData, eventId }: {
            eventId: IdParam,
            checkInListData: CheckInListRequest,
        }) => checkInListClient.create(eventId, checkInListData),

        onSuccess: (_, variables) => queryClient
            .invalidateQueries({ queryKey: [GET_EVENT_CHECK_IN_LISTS_QUERY_KEY, variables.eventId] })
    });
}
