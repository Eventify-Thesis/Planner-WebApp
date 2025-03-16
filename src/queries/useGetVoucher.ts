import { vouchersClient } from '@/api/vouchers.client';
import { VoucherModel } from '@/domain/VoucherModel';
import { IdParam } from '@/types/types.ts';
import { useQuery } from '@tanstack/react-query';

export const GET_VOUCHER_QUERY_KEY = 'getVoucher';

export const useGetVoucher = (eventId: IdParam, voucherId: IdParam) => {
  return useQuery<VoucherModel>({
    queryKey: [GET_VOUCHER_QUERY_KEY, eventId, voucherId],

    queryFn: async () => {
      const data = await vouchersClient.getDetail(eventId, voucherId);
      return data;
    },
  });
};
