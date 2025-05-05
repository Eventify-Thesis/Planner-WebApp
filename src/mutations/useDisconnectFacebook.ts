import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingClient } from '@/api/marketing.client';
import { CHECK_FACEBOOK_AUTH_QUERY_KEY } from '@/queries/useCheckFacebookAuth';
import { GET_FACEBOOK_PAGES_QUERY_KEY } from '@/queries/useGetFacebookPages';

export const useDisconnectFacebook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await marketingClient.disconnectFacebook(userId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [CHECK_FACEBOOK_AUTH_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [GET_FACEBOOK_PAGES_QUERY_KEY] });
    },
  });
};
