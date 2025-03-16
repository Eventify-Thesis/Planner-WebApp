import { vouchersClient } from '@/api/vouchers.client';
import { CreateVoucherDto, VoucherModel } from '@/domain/VoucherModel';
import { IdParam } from '@/types/types.ts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GET_EVENT_VOUCHERS_QUERY_KEY } from '@/queries/useGetEventVouchers';

interface CreateVoucherVariables {
  eventId: IdParam;
  voucherData: CreateVoucherDto;
}

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, voucherData }: CreateVoucherVariables) => {
      return await vouchersClient.create(eventId, voucherData);
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate the event vouchers list to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [GET_EVENT_VOUCHERS_QUERY_KEY, eventId],
      });
    },
  });
};
