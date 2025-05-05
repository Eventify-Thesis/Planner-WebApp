import { useQuery } from '@tanstack/react-query';
import { marketingClient, FacebookPage } from '@/api/marketing.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const GET_FACEBOOK_PAGES_QUERY_KEY = 'getFacebookPages';

export const useGetFacebookPages = (eventId: IdParam) => {
  return useQuery<FacebookPage[], AxiosError>({
    queryKey: [GET_FACEBOOK_PAGES_QUERY_KEY, eventId],
    queryFn: async () => {
      const data = await marketingClient.getFacebookPages(eventId);
      return data;
    },
  });
};
