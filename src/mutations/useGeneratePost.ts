import { useMutation } from '@tanstack/react-query';
import { marketingClient, GeneratePostDto } from '@/api/marketing.client';
import { IdParam } from '@/types/types';
import { AxiosError } from 'axios';

interface GeneratePostVariables {
  eventId: IdParam;
  data: GeneratePostDto;
}

export const useGeneratePost = () => {
  return useMutation<string, AxiosError, GeneratePostVariables>({
    mutationFn: async ({ eventId, data }) => {
      const response = await marketingClient.generatePost(eventId, data);
      return response;
    },
  });
};
