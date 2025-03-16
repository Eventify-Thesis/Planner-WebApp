import { useQuery } from '@tanstack/react-query';
import { IdParam, PaginationResponse, QueryFilters } from '@/types/types.ts';
import { vouchersClient } from '@/api/vouchers.client';
import { VoucherModel } from '@/domain/VoucherModel';

export const GET_EVENT_VOUCHERS_QUERY_KEY = 'getEventVouchers';

export const useGetEventVouchers = (
  eventId: IdParam,
  pagination: QueryFilters,
) => {
  return useQuery<PaginationResponse<VoucherModel>>({
    queryKey: [GET_EVENT_VOUCHERS_QUERY_KEY, eventId, pagination],
    queryFn: async () => await vouchersClient.getList(eventId, pagination),
  });
};
