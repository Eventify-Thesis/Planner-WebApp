import { useQuery } from "@tanstack/react-query";
import { attendeesClient } from "../api/attendee.client.ts";
import { IdParam } from "@/types/types.ts";
import { AttendeeModel } from "@/domain/OrderModel.ts";

export const GET_ATTENDEE_QUERY_KEY = 'getAttendee';

export const useGetAttendee = (eventId: IdParam, attendeeId: IdParam) => {
    return useQuery<AttendeeModel>({
        queryKey: [GET_ATTENDEE_QUERY_KEY, eventId, attendeeId],

        queryFn: async () => {
            const { data } = await attendeesClient.findById(eventId, attendeeId);
            return data;
        },

        staleTime: 0,
        gcTime: 0
    });
};
