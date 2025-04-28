import { useParams } from 'react-router-dom';
import { useGetAttendees } from '../../../queries/useGetAttendees.ts';
import { PageBody } from '../../common/PageBody';
import { AttendeeTable } from '../../common/AttendeeTable';
import { SearchBarWrapper } from '../../common/SearchBar';
import { Pagination } from '../../common/Pagination';
import { Button } from '@mantine/core';
import { IconDownload, IconPlus } from '@tabler/icons-react';
import { ToolBar } from '../../common/ToolBar';
import { TableSkeleton } from '../../common/TableSkeleton';
import { useFilterQueryParamSync } from '../../../hooks/useFilterQueryParamSync.ts';
import { IdParam, QueryFilters } from '@/types/types.ts';
import { useDisclosure } from '@mantine/hooks';
import { CreateAttendeeModal } from '../../modals/CreateAttendeeModal';
import { downloadBinary } from '../../../utils/download.ts';
import { attendeesClient } from '@/api/attendee.client.ts';
import { useState } from 'react';
import { showError } from '../../../utils/notifications.tsx';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/common/MantinePageTitle/index.tsx';

const Attendees = () => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const [searchParams, setSearchParams] = useFilterQueryParamSync();
  const { data: attendeesQuery } = useGetAttendees(
    eventId,
    searchParams as QueryFilters,
  );
  const attendees = attendeesQuery?.docs;
  const pagination = attendeesQuery?.totalPages;
  const [createModalOpen, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [downloadPending, setDownloadPending] = useState(false);

  console.log(attendeesQuery);
  const handleExport = (eventId: IdParam) => {
    setDownloadPending(true);
    attendeesClient
      .export(eventId)
      .then((blob) => {
        downloadBinary(blob, 'attendees.xlsx');
        setDownloadPending(false);
      })
      .catch(() => {
        setDownloadPending(false);
        showError(t`Failed to export attendees. Please try again.`);
      });
  };

  return (
    <div
      style={{
        padding: '24px',
      }}
    >
      <PageBody>
        <PageTitle>{t`Attendees`}</PageTitle>

        <ToolBar
          searchComponent={() => (
            <SearchBarWrapper
              placeholder={t`Search by attendee name, email or order #...`}
              setSearchParams={setSearchParams}
              searchParams={searchParams}
              //   pagination={pagination}
            />
          )}
        >
          <Button
            color={'green'}
            size={'sm'}
            onClick={openCreateModal}
            rightSection={<IconPlus />}
          >
            {t`Add`}
          </Button>

          <Button
            color={'green'}
            size={'sm'}
            loading={downloadPending}
            onClick={() => handleExport(eventId)}
            rightSection={<IconDownload />}
          >
            {t`Export`}
          </Button>
        </ToolBar>

        <TableSkeleton isVisible={!attendees} />

        {!!attendees && (
          <AttendeeTable
            openCreateModal={openCreateModal}
            attendees={attendees}
          />
        )}

        {!!attendees?.length && (
          <Pagination
            value={searchParams.page}
            onChange={(value) => setSearchParams({ page: value })}
            total={Number(pagination)}
          />
        )}
      </PageBody>
      {createModalOpen && (
        <CreateAttendeeModal
          onClose={closeCreateModal}
          isOpen={createModalOpen}
        />
      )}
    </div>
  );
};

export default Attendees;
