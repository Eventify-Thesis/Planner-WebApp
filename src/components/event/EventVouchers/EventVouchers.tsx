import { useParams } from 'react-router-dom';
import { PageTitle } from '@/components/common/MantinePageTitle';
import { PageBody } from '@/components/common/PageBody';
import { VoucherTable } from '@/components/common/VoucherTable';
import { SearchBarWrapper } from '@/components/common/SearchBar';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { CreateVoucherModal } from '../../modals/CreateVoucherModal';
import { QueryFilters } from '@/types/types.ts';
import { TableSkeleton } from '../../common/TableSkeleton';
import { ToolBar } from '../../common/ToolBar';
import { useFilterQueryParamSync } from '@/hooks/useFilterQueryParamSync';
import { useTranslation } from 'react-i18next';
import { useGetEvent } from '@/queries/useGetEvent';
import { useGetEventVouchers } from '@/queries/useGetEventVouchers';

export const EventVouchers = () => {
  const { eventId } = useParams();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useFilterQueryParamSync();

  const { data: event } = useGetEvent(eventId);
  const vouchersQuery = useGetEventVouchers(
    eventId,
    searchParams as QueryFilters,
  );

  const pagination = vouchersQuery?.data?.meta;
  const vouchers = vouchersQuery?.data?.docs;

  const [createModalOpen, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);

  return (
    <div style={{ padding: 24 }}>
      <PageBody>
        <PageTitle>Event Vouchers</PageTitle>
        <ToolBar
          searchComponent={() => (
            <SearchBarWrapper
              placeholder={t`Search by name...`}
              setSearchParams={setSearchParams}
              searchParams={searchParams}
              // pagination={pagination}
            />
          )}
        >
          <Button
            color={'green'}
            size={'sm'}
            onClick={openCreateModal}
            rightSection={<IconPlus />}
          >
            Create
          </Button>
        </ToolBar>

        <TableSkeleton isVisible={!vouchers || !event} />

        {vouchers && event && (
          <VoucherTable
            openCreateModal={openCreateModal}
            event={event}
            vouchers={vouchers}
          />
        )}

        {/* {!!vouchers?.length && (
          <Pagination
            value={searchParams.pageNumber}
            // onChange={(value) => setSearchParams({ pageNumber: value })}
            total={Number(pagination?.last_page)}
          />
        )} */}
      </PageBody>
      {createModalOpen && (
        <CreateVoucherModal onClose={closeCreateModal} isOpen />
      )}
    </div>
  );
};

export default EventVouchers;
