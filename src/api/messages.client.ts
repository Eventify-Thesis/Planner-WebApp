import { IdParam, Message, PaginationResponse, QueryFilters, } from "@/types/types";
import { queryParamsHelper } from "../utils/queryParamsHelper";
import { AxiosResponse } from "axios";
import { httpApi } from "./http.api.ts";

export const messagesClient = {
    send: async (eventId: IdParam, messagesRequest: Message) => {
        return await httpApi.post(`planner/events/${eventId}/messages`, messagesRequest);
    },
    all: async (eventId: IdParam, pagination: QueryFilters) => {
        const response: AxiosResponse<PaginationResponse<Message>> = await httpApi.get<PaginationResponse<Message>>(
            `planner/events/${eventId}/messages` + queryParamsHelper.buildQueryString(pagination),
        );
        return response.data;
    },
}
