import { useQuery } from '@tanstack/react-query';
import { IdParam, QueryFilters } from '@/types/types.ts';
import { checkInClient } from "../api/check-in.client";

export const GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY = 'getCheckInListAttendees';

export const useGetCheckInListAttendees = (eventId: IdParam, checkInListShortId: IdParam, pagination: QueryFilters, enabled: boolean = true) => {
    return useQuery<any>({
        queryKey: [GET_CHECK_IN_LIST_ATTENDEES_PUBLIC_QUERY_KEY, checkInListShortId, pagination],
        queryFn: async () => {
            const { data } = await checkInClient.getCheckInListAttendees(eventId, checkInListShortId, pagination);
            return data;
        },
        enabled: enabled,
    });
};
