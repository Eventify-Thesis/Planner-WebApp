import { useQuery } from '@tanstack/react-query';
import { marketingClient } from '@/api/marketing.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const CHECK_FACEBOOK_AUTH_QUERY_KEY = 'checkFacebookAuth';

export const useCheckFacebookAuth = (userId: string) => {
  return useQuery<{ isAuthenticated: boolean }, AxiosError>({
    queryKey: [CHECK_FACEBOOK_AUTH_QUERY_KEY, userId],
    queryFn: async () => {
      const response = await marketingClient.checkFacebookAuth(userId);
      return response.data;
    },
  });
};
