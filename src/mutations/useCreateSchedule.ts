import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleClient, CreateScheduleDto } from '@/api/schedule.client';
import { GET_SHOW_SCHEDULES_QUERY_KEY } from '@/queries/useGetShowSchedules';
import { IdParam } from '@/types/types';

export const useCreateSchedule = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateScheduleDto) => {
      return await scheduleClient.createSchedule(eventId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate the query for this specific show
      queryClient.invalidateQueries({
        queryKey: [GET_SHOW_SCHEDULES_QUERY_KEY, eventId, variables.showId],
      });
    },
  });
};
