import { useQuery } from '@tanstack/react-query';
import { scheduleClient, ScheduleModel } from '@/api/schedule.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const GET_SHOW_SCHEDULES_QUERY_KEY = 'getShowSchedules';

export const useGetShowSchedules = (eventId: IdParam | undefined, showId: IdParam | undefined) => {
  return useQuery<ScheduleModel[], AxiosError>({
    queryKey: [GET_SHOW_SCHEDULES_QUERY_KEY, eventId, showId],
    queryFn: async () => {
      if (showId == undefined || showId == null) {
        const data = await scheduleClient.getShowSchedulesList(eventId);
        return data;
      }
      const data = await scheduleClient.getSchedulesByShow(eventId, showId);
      return data;
    },
    enabled: showId != undefined && showId != null,
    staleTime: 5,
  });
};
