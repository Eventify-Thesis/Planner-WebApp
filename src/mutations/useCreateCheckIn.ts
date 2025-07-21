import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY } from "../queries/useGetCheckInListAttendees.ts";
import { IdParam, QueryFilters } from "@/types/types.ts";
import { checkInClient } from "../api/check-in.client.ts";

export const useCreateCheckIn = ({ eventId, pagination }: { eventId: IdParam, pagination: QueryFilters }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ checkInListShortId, attendeePublicId }: { checkInListShortId: IdParam, attendeePublicId: IdParam }) =>
            checkInClient.createCheckIn(eventId, checkInListShortId, attendeePublicId),

        onSuccess: (data, { checkInListShortId, attendeePublicId }) => {
            // Only update cache if there are no errors for this attendee
            if (data.errors && data.errors[attendeePublicId]) {
                // Don't update cache if there was an error for this attendee
                return;
            }

            // Find the attendee in the cache and update the check-in status
            queryClient.setQueryData([GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY, checkInListShortId, pagination], (oldData: any) => {
                if (!oldData || !oldData.items) {
                    return oldData;
                }
                
                const checkIns = data.data;
                if (!checkIns || !checkIns.length) {
                    return oldData;
                }
                
                const newCheckIn = checkIns[0]; // Since we're checking in one attendee, take the first
                
                const newAttendees = oldData.items.map((attendee: any) => {
                    if (attendee.publicId === attendeePublicId) {
                        return {
                            ...attendee,
                            checkIn: newCheckIn,
                        };
                    }
                    return attendee;
                });

                return {
                    ...oldData,
                    items: newAttendees,
                };
            });
            
            // Also invalidate queries to ensure UI updates
            queryClient.invalidateQueries({ 
                queryKey: [GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY, checkInListShortId] 
            });
        }
    });
};
