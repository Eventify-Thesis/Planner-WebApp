import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleClient, UpdateScheduleDto } from '@/api/schedule.client';
import { GET_SHOW_SCHEDULES_QUERY_KEY } from '@/queries/useGetShowSchedules';
import { IdParam } from '@/types/types';

interface UpdateScheduleParams {
  id: IdParam;
  showId: IdParam;
  data: UpdateScheduleDto;
}

export const useUpdateSchedule = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateScheduleParams) => {
      return await scheduleClient.updateSchedule(eventId, id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate the query for this specific show
      queryClient.invalidateQueries({
        queryKey: [GET_SHOW_SCHEDULES_QUERY_KEY, eventId, variables.showId],
      });
    },
  });
};
