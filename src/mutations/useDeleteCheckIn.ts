import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkInClient } from "../api/check-in.client.ts";
import { GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY } from "../queries/useGetCheckInListAttendees.ts";
import { IdParam, QueryFilters } from "@/types/types.ts";

export const useDeleteCheckIn = ({ eventId, pagination }: { eventId: IdParam, pagination: QueryFilters }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ checkInListShortId, attendeePublicId }: { checkInListShortId: IdParam, attendeePublicId: IdParam }) =>
            checkInClient.deleteCheckIn(eventId, checkInListShortId, attendeePublicId),

        onSettled: (data, error, { checkInListShortId, attendeePublicId }) => {
            if (error) {
                return;
            }

            // Find the attendee in the cache and remove the check-in status
            queryClient.setQueryData([GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY, checkInListShortId, pagination], (oldData: any) => {
                if (!oldData || !oldData.items) {
                    return oldData;
                }
                
                const newAttendees = oldData.items.map((attendee: any) => {
                    if (attendee.publicId === attendeePublicId) {
                        return {
                            ...attendee,
                            checkIn: null,
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
