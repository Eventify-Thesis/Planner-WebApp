import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleClient } from '@/api/schedule.client';
import { GET_SHOW_SCHEDULES_QUERY_KEY } from '@/queries/useGetShowSchedules';
import { IdParam } from '@/types/types';

interface DeleteScheduleParams {
  id: IdParam;
  showId: IdParam;
}

export const useDeleteSchedule = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteScheduleParams) => {
      return await scheduleClient.deleteSchedule(eventId, id);
    },
    onSuccess: (_, variables) => {
      // Invalidate the query for this specific show
      queryClient.invalidateQueries({
        queryKey: [GET_SHOW_SCHEDULES_QUERY_KEY, eventId, variables.showId],
      });
    },
  });
};
