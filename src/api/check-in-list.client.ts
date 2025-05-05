
import { queryParamsHelper } from "@/utils/queryParamsHelper";
import { httpApi } from "./http.api";
import { CheckInListRequest } from "@/domain/CheckInListModel";
import { IdParam, QueryFilters } from "@/types/types";

export const checkInListClient = {
    create: async (eventId: IdParam, checkInList: CheckInListRequest) => {
        const response = await httpApi.post<any>(`planner/events/${eventId}/check-in-lists`, checkInList);
        return response.data;
    },
    update: async (eventId: IdParam, checkInListId: IdParam, checkInList: CheckInListRequest) => {
        const response = await httpApi.put<any>(`planner/events/${eventId}/check-in-lists/${checkInListId}`, checkInList);
        return response.data;
    },
    all: async (eventId: IdParam, pagination: QueryFilters) => {
        const response = await httpApi.get<any>(`planner/events/${eventId}/check-in-lists` + queryParamsHelper.buildQueryString(pagination));
        return response.data.data;
    },
    get: async (eventId: IdParam, checkInListId: IdParam) => {
        const response = await httpApi.get<any>(`planner/events/${eventId}/check-in-lists/${checkInListId}`);
        return response.data;
    },
    delete: async (eventId: IdParam, checkInListId: IdParam) => {
        const response = await httpApi.delete<any>(`planner/events/${eventId}/check-in-lists/${checkInListId}`);
        return response.data;
    },
}
