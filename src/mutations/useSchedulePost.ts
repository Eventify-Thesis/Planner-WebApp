import { useMutation } from '@tanstack/react-query';
import { marketingClient, SchedulePostDto } from '@/api/marketing.client';
import { IdParam } from '@/types/types';
import { AxiosError } from 'axios';

interface SchedulePostVariables {
  eventId: IdParam;
  data: SchedulePostDto;
}

export const useSchedulePost = () => {
  return useMutation<any, AxiosError, SchedulePostVariables>({
    mutationFn: async ({ eventId, data }) => {
      const response = await marketingClient.schedulePost(eventId, data);
      return response.data;
    },
  });
};
