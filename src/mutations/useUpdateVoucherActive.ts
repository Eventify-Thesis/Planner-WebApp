import { useMutation } from '@tanstack/react-query';
import { GET_EVENT_VOUCHERS_QUERY_KEY } from '../queries/useGetEventVouchers.ts';
import { useQueryClient } from '@tanstack/react-query';
import { GET_VOUCHER_QUERY_KEY } from '../queries/useGetVoucher.ts';
import { IdParam } from '@/types/types.ts';
import { vouchersClient } from '@/api/vouchers.client';

export const useUpdateVoucherActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      voucherId,
      active,
    }: {
      voucherId: IdParam;
      eventId: IdParam;
      active: boolean;
    }) => vouchersClient.updateActive(eventId, voucherId, active),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_EVENT_VOUCHERS_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [GET_VOUCHER_QUERY_KEY] });
    },
  });
};
