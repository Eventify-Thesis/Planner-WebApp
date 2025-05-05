import { PageBody } from '@/components/common/PageBody';
import { useParams } from 'react-router-dom';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useDisclosure } from '@mantine/hooks';
import { ToolBar } from '@/components/common/ToolBar';
import { SearchBarWrapper } from '@/components/common/SearchBar';
import { Button, Loader, LoadingOverlay, Select } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useFilterQueryParamSync } from '@/hooks/useFilterQueryParamSync.ts';
import { QueryFilters } from '@/types/types.ts';
import { Pagination } from '@/components/common/Pagination';
import { useGetEventCheckInLists } from '@/queries/useGetCheckInLists.ts';
import { CheckInListList } from '@/components/common/CheckInListList';
import { CreateCheckInListModal } from '@/components/modals/CreateCheckInListModal';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/common/MantinePageTitle';
import { useGetEventShow } from '@/queries/useGetEventShow';
import { formatDate } from '@/utils/dates';

const CheckInLists = () => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const [searchParams, setSearchParams] = useFilterQueryParamSync();
  const { data: checkInListsData } = useGetEventCheckInLists(
    eventId,
    searchParams as QueryFilters,
  );

  const { data: shows } = useGetEventShow(eventId);
  const checkInLists = checkInListsData?.docs;
  // const pagination = checkInListsData?.meta;
  const [createModalOpen, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);

  if (!shows) {
    return <Loader />;
  }

  return (
    <div
      style={{
        padding: '24px',
      }}
    >
      <PageBody>
        <PageTitle>{t`Check-In Lists`}</PageTitle>

        <ToolBar
          searchComponent={() => (
            <SearchBarWrapper
              placeholder={t`Search check-in lists...`}
              setSearchParams={setSearchParams}
              searchParams={searchParams}
              shows={shows?.map((show) => ({
                value: String(show.id),
                label: formatDate(show.startDate, 'MMM DD', 'Asia/Bangkok'),
              }))}
              // pagination={pagination}
            />
          )}
        >
          <Button
            leftSection={<IconPlus />}
            color={'green'}
            onClick={openCreateModal}
          >
            {t`Create Check-In List`}
          </Button>
        </ToolBar>

        <TableSkeleton isVisible={!checkInLists} />

        {checkInLists && (
          <CheckInListList
            checkInLists={checkInLists}
            openCreateModal={openCreateModal}
          />
        )}

        {createModalOpen && (
          <CreateCheckInListModal onClose={closeCreateModal} />
        )}

        {!!checkInLists?.length && (checkInListsData?.totalDocs || 0) >= 20 && (
          <Pagination
            value={searchParams.page}
            onChange={(value) => setSearchParams({ page: value })}
            total={Number(checkInListsData?.totalPages)}
          />
        )}
      </PageBody>
    </div>
  );
};

export default CheckInLists;
