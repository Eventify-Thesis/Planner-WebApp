import { useParams } from 'react-router-dom';
import { useGetEvent } from '../../../queries/useGetEvent.ts';
import { PageBody } from '../../common/PageBody';
import { OrdersTable } from '../../common/OrdersTable';
import { SearchBarWrapper } from '../../common/SearchBar';
import { Pagination } from '../../common/Pagination';
import { IconDownload } from '@tabler/icons-react';
import { ToolBar } from '../../common/ToolBar';
import { useFilterQueryParamSync } from '../../../hooks/useFilterQueryParamSync.ts';
import { TableSkeleton } from '../../common/TableSkeleton';
import { useState } from 'react';
import { Button } from '@mantine/core';
import { PageTitle } from '@/components/common/MantinePageTitle/index.tsx';
import { useTranslation } from 'react-i18next';
import { IdParam, QueryFilters } from '@/types/types.ts';
import { showError } from '@/utils/notifications.tsx';
import { downloadBinary } from '@/utils/download.ts';
import { useGetEventOrders } from '@/queries/useGetEventOrders.ts';
import { orderClient } from '@/api/order.client.ts';

export const Orders = () => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const { data: event } = useGetEvent(eventId);
  const [searchParams, setSearchParams] = useFilterQueryParamSync();
  const { data: ordersData, isLoading } = useGetEventOrders({
    eventId,
    pagination: searchParams as QueryFilters,
  });

  const orders = ordersData?.docs;
  const [downloadPending, setDownloadPending] = useState(false);

  const handleExport = (eventId: IdParam) => {
    setDownloadPending(true);
    orderClient
      .exportOrders(eventId)
      .then((blob) => {
        downloadBinary(blob, 'orders.xlsx');
        setDownloadPending(false);
      })
      .catch(() => {
        setDownloadPending(false);
        showError(t`Failed to export orders. Please try again.`);
      });
  };

  return (
    <div
      style={{
        padding: '24px',
      }}
    >
      <PageBody>
        <PageTitle>{t`Orders`}</PageTitle>
        <ToolBar
          searchComponent={() => (
            <SearchBarWrapper
              placeholder={t`Search by name, email, or order #...`}
              setSearchParams={setSearchParams}
              searchParams={searchParams}
              // pagination={pagination}
            />
          )}
        >
          <Button
            onClick={() => handleExport(eventId)}
            rightSection={<IconDownload size={14} />}
            color={'green'}
            loading={downloadPending}
          >
            {t`Export`}
          </Button>
        </ToolBar>

        <TableSkeleton isVisible={!orders || isLoading} />

        {orders && event && <OrdersTable orders={orders} />}

        {!!orders?.length && (
          <Pagination
            value={searchParams.page}
            onChange={(value) => setSearchParams({ page: value })}
            total={Number(ordersData?.totalPages)}
          />
        )}
      </PageBody>
    </div>
  );
};

export default Orders;
