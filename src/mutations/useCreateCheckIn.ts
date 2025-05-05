import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY } from "../queries/useGetCheckInListAttendees.ts";
import { IdParam, QueryFilters } from "@/types/types.ts";
import { checkInClient } from "../api/check-in.client.ts";

export const useCreateCheckIn = ({ eventId, pagination }: { eventId: IdParam, pagination: QueryFilters }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ checkInListShortId, attendeePublicId }: { checkInListShortId: IdParam, attendeePublicId: IdParam }) =>
            checkInClient.createCheckIn(eventId, checkInListShortId, attendeePublicId),

        onSuccess: (data, { checkInListShortId }) => {
            // Find the attendee in the cache and update the check-in status
            queryClient.setQueryData([GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY, checkInListShortId, pagination], (oldData: any) => {
                const newData = data.data;
                const newAttendees = oldData.items.map((attendee: any) => {
                    if (newData?.length && attendee.id === newData[0].attendeeId) {
                        return {
                            ...attendee,
                            checkIn: newData[0],
                        };
                    }
                    return attendee;
                });

                return {
                    ...oldData,
                    items: newAttendees,
                };
            }
            )
        }
    });
};
