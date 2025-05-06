import { httpApi } from './http.api';
import { IdParam } from '@/types/types';

export interface ScheduleModel {
  id: string;
  showId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface CreateScheduleDto {
  showId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface UpdateScheduleDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export const scheduleClient = {
  getSchedulesByShow: async (eventId: IdParam, showId: IdParam): Promise<ScheduleModel[]> => {
    try {
      if (!showId) {
        const data = await scheduleClient.getShowSchedulesList(eventId);
        return data;
      }
      const response = await httpApi.get<any>(`planner/events/${eventId}/show-schedules/shows/${showId}`);
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getShowSchedulesList: async (eventId: IdParam): Promise<ScheduleModel[]> => {
    try {
      const response = await httpApi.get<any>(`planner/events/${eventId}/show-schedules/list`);
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  createSchedule: async (eventId: IdParam, data: CreateScheduleDto): Promise<ScheduleModel> => {
    try {
      const response = await httpApi.post<any>(`planner/events/${eventId}/show-schedules/shows/${data.showId}`, data);
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  updateSchedule: async (eventId: IdParam, id: IdParam, data: UpdateScheduleDto): Promise<ScheduleModel> => {
    try {
      const response = await httpApi.put<any>(`planner/events/${eventId}/show-schedules/${id}`, data);
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  deleteSchedule: async (eventId: IdParam, id: IdParam): Promise<void> => {
    try {
      await httpApi.delete<any>(`planner/events/${eventId}/show-schedules/${id}`);
    } catch (e: any) {
      throw new Error(e);
    }
  }
};
