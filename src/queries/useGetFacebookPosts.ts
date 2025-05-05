import { useQuery } from '@tanstack/react-query';
import { marketingClient } from '@/api/marketing.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export interface FacebookPost {
  id: string;
  message: string;
  imageUrls: string[];
  scheduledAt: string;
  likes: number;
  comments: number;
  shares: number;
}

export const GET_FACEBOOK_POSTS_QUERY_KEY = 'getFacebookPosts';

export const useGetFacebookPosts = (eventId: IdParam, pageId: string | null) => {
  return useQuery<FacebookPost[], AxiosError>({
    queryKey: [GET_FACEBOOK_POSTS_QUERY_KEY, eventId, pageId],
    queryFn: async () => {
      if (!pageId) return [];
      const response = await marketingClient.getFacebookPosts(eventId, pageId);
      return response.data.result;
    },
    enabled: !!pageId,
  });
};
