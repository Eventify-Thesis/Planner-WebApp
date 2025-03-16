import { vouchersClient } from '@/api/vouchers.client';
import { IdParam } from '@/types/types.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GET_EVENT_VOUCHERS_QUERY_KEY } from '@/queries/useGetEventVouchers';

interface DeleteVoucherVariables {
  eventId: IdParam;
  voucherId: IdParam;
}

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, voucherId }: DeleteVoucherVariables) => {
      return await vouchersClient.delete(eventId, voucherId);
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate the event vouchers list to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [GET_EVENT_VOUCHERS_QUERY_KEY, eventId],
      });
    },
  });
};
