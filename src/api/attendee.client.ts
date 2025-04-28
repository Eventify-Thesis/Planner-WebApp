import { GenericDataResponse, IdParam, PaginationResponse, QueryFilters } from "@/types/types";
import { queryParamsHelper } from "../utils/queryParamsHelper.ts";
import { httpApi } from "./http.api.ts";
import { AttendeeModel } from "@/domain/OrderModel.ts";

export interface EditAttendeeRequest {
    firstName: string;
    lastName: string;
    email: string;
    ticketTypeId?: IdParam;
    status?: string;
}

export interface CreateAttendeeRequest extends EditAttendeeRequest {
    amountPaid: number,
    sendConfirmationEmail: boolean,
}

export const attendeesClient = {
    create: async (eventId: IdParam, attendee: CreateAttendeeRequest) => {
        const response = await httpApi.post<GenericDataResponse<AttendeeModel>>(
            `planner/events/${eventId}/attendees`, attendee
        );
        return response.data;
    },
    update: async (eventId: IdParam, attendeeId: IdParam, attendee: EditAttendeeRequest) => {
        const response = await httpApi.put<GenericDataResponse<AttendeeModel>>(
            `planner/events/${eventId}/attendees/${attendeeId}`, attendee
        );
        return response.data;
    },
    modify: async (eventId: IdParam, attendeeId: IdParam, attendee: Partial<EditAttendeeRequest>) => {
        const response = await httpApi.patch<GenericDataResponse<AttendeeModel>>(
            `planner/events/${eventId}/attendees/${attendeeId}`, attendee
        );
        return response.data;
    },
    all: async (eventId: IdParam, queryFilters: QueryFilters) => {
        const response = await httpApi.get<PaginationResponse<AttendeeModel>>(
            `planner/events/${eventId}/attendees` + queryParamsHelper.buildQueryString(queryFilters)
        );
        return response.data.data;
    },
    findById: async (eventId: IdParam, attendeeId: IdParam) => {
        const response = await httpApi.get<GenericDataResponse<AttendeeModel>>(`planner/events/${eventId}/attendees/${attendeeId}`);
        return response.data;
    },
    checkIn: async (eventId: IdParam, attendeePublicId: string, action: 'check_in' | 'check_out') => {
        const response = await httpApi.post<GenericDataResponse<AttendeeModel>>(`planner/events/${eventId}/attendees/${attendeePublicId}/check_in`, {
            action: action,
        });
        return response.data;
    },
    export: async (eventId: IdParam): Promise<Blob> => {
        const response = await httpApi.post(`planner/events/${eventId}/attendees/export`, {}, {
            responseType: 'blob',
        });

        return new Blob([response.data]);
    },
    resendTicket: async (eventId: IdParam, attendeeId: IdParam) => {
        return await httpApi.post(`planner/events/${eventId}/attendees/${attendeeId}/resend-ticket`);
    },
}
