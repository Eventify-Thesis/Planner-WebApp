import { useMutation } from '@tanstack/react-query';
import { GET_EVENT_VOUCHERS_QUERY_KEY } from '../queries/useGetEventVouchers.ts';
import { useQueryClient } from '@tanstack/react-query';
import { GET_VOUCHER_QUERY_KEY } from '../queries/useGetVoucher.ts';
import { VoucherModel } from '@/domain/VoucherModel.ts';
import { IdParam } from '@/types/types.ts';
import { vouchersClient } from '@/api/vouchers.client.ts';

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      voucherId,
      voucherData,
    }: {
      voucherId: IdParam;
      eventId: IdParam;
      voucherData: VoucherModel;
    }) => vouchersClient.update(eventId, voucherId, voucherData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GET_EVENT_VOUCHERS_QUERY_KEY],
      });
      queryClient.invalidateQueries({ queryKey: [GET_VOUCHER_QUERY_KEY] });
    },
  });
};
