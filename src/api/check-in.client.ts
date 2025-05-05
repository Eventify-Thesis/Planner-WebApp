import {
    IdParam,
    QueryFilters,
} from "@/types/types";
import { queryParamsHelper } from "@/utils/queryParamsHelper";
import { httpApi } from "./http.api";

export const checkInClient = {
    getCheckInList: async (eventId: IdParam, checkInListShortId: IdParam) => {
        const response = await httpApi.get<any>(`planner/events/${eventId}/check-in/${checkInListShortId}`);
        return response.data.data;
    },
    getCheckInListAttendees: async (eventId: IdParam, checkInListShortId: IdParam, pagination: QueryFilters) => {
        const response = await httpApi.get<any>(`planner/events/${eventId}/check-in/${checkInListShortId}/attendees` + queryParamsHelper.buildQueryString(pagination));
        return response.data;
    },
    createCheckIn: async (eventId: IdParam, checkInListShortId: IdParam, attendeePublicId: IdParam) => {
        const response = await httpApi.post<any>(`planner/events/${eventId}/check-in/${checkInListShortId}/check-ins`, {
            "attendee_public_ids": [attendeePublicId],
        });
        return response.data.data;
    },
    deleteCheckIn: async (eventId: IdParam, checkInListShortId: IdParam, checkInShortId: IdParam) => {
        const response = await httpApi.delete<any>(`planner/events/${eventId}/check-in/${checkInListShortId}/check-ins/${checkInShortId}`);
        return response.data;
    },
};
