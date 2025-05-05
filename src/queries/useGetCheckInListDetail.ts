import { useQuery } from '@tanstack/react-query';
import { checkInClient } from '../api/check-in.client.ts';
import { IdParam } from '@/types/types.ts';

export const GET_CHECK_IN_LIST_PUBLIC_QUERY_KEY = 'getCheckInListPublic';

export const useGetCheckInListDetail = (eventId: IdParam, checkInListShortId: IdParam) => {
    return useQuery({
        queryKey: [GET_CHECK_IN_LIST_PUBLIC_QUERY_KEY, eventId, checkInListShortId],

        queryFn: async () => {
            const data = await checkInClient.getCheckInList(eventId, checkInListShortId);
            return data;
        },

        retry: false
    });
};
