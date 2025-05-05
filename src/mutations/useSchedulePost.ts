import { useMutation } from '@tanstack/react-query';
import { marketingClient, SchedulePostDto } from '@/api/marketing.client';
import { IdParam } from '@/types/types';
import { AxiosError } from 'axios';

interface SchedulePostVariables {
  eventId: IdParam;
  data: SchedulePostDto;
}

export const useSchedulePost = () => {
  return useMutation<void, AxiosError, SchedulePostVariables>({
    mutationFn: async ({ eventId, data }) => {
      await marketingClient.schedulePost(eventId, data);
    },
  });
};
