import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInClient } from "../api/check-in.client.ts";
import { GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY } from "../queries/useGetCheckInListAttendees.ts";
import { IdParam, QueryFilters } from "@/types/types.ts";

export const useDeleteCheckIn = ({ eventId, pagination }: { eventId: IdParam, pagination: QueryFilters }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ checkInListShortId, checkInShortId }: { checkInListShortId: IdParam, checkInShortId: IdParam }) =>
            checkInClient.deleteCheckIn(eventId, checkInListShortId, checkInShortId),

        onSettled: (_, error, { checkInListShortId, checkInShortId }) => {
            if (error) {
                return;
            }

            // Find the attendee in the cache and remove the check-in status
            queryClient.setQueryData([GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY, checkInListShortId, pagination], (oldData: any) => {
                const newAttendees = oldData?.items?.map((attendee: any) => {
                    if (attendee.checkIn?.shortId === checkInShortId) {
                        return {
                            ...attendee,
                            checkIn: undefined,
                        };
                    }
                    return attendee;
                });

                return {
                    ...oldData,
                    items: newAttendees,
                };
            });
        }
    });
};
