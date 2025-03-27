import { useParams } from 'react-router-dom';
import { PageTitle } from '@/components/common/MantinePageTitle';
import { PageBody } from '@/components/common/PageBody';
import { SearchBarWrapper } from '@/components/common/SearchBar';
import { useDisclosure } from '@mantine/hooks';
import { Button, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { QueryFilters } from '@/types/types';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { ToolBar } from '@/components/common/ToolBar';
import { useFilterQueryParamSync } from '@/hooks/useFilterQueryParamSync';
import { useTranslation } from 'react-i18next';
import { Table, Space, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SeatingPlanModel } from '@/domain/SeatingPlanModel';
import { Link } from 'react-router-dom';
import {
  useGetSeatingPlanList,
  useSeatingPlanMutations,
} from '@/queries/useSeatingPlanQueries';

export const EventSeatingPlans = () => {
  const { eventId } = useParams();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useFilterQueryParamSync();

  const { data: seatingPlans, isLoading } = useGetSeatingPlanList(
    eventId!,
    searchParams as QueryFilters,
  );
  const { deleteMutation } = useSeatingPlanMutations(eventId!);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success(t('Seating plan deleted successfully'));
    } catch (error) {
      message.error(t('Failed to delete seating plan'));
    }
  };

  const columns: ColumnsType<SeatingPlanModel> = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SeatingPlanModel) => (
        <Link to={`/events/${eventId}/seatmap/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('Created At'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('Actions'),
      key: 'actions',
      render: (_: any, record: SeatingPlanModel) => (
        <Group>
          <Link to={`/events/${eventId}/seatmap/${record.id}`}>
            <Button size="xs" variant="outline">
              {t('Edit')}
            </Button>
          </Link>
          <Popconfirm
            title={t('Are you sure you want to delete this seating plan?')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('Yes')}
            cancelText={t('No')}
          >
            <Button size="xs" color="red" variant="outline">
              {t('Delete')}
            </Button>
          </Popconfirm>
        </Group>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <PageBody>
        <PageTitle>{t('Seating Plans')}</PageTitle>
        <ToolBar
          searchComponent={() => (
            <SearchBarWrapper
              placeholder={t('Search by name...')}
              setSearchParams={setSearchParams}
              searchParams={searchParams}
            />
          )}
        >
          <Link to={`/events/${eventId}/seatmap/new`}>
            <Button color="green" size="sm" rightSection={<IconPlus />}>
              {t('Create')}
            </Button>
          </Link>
        </ToolBar>

        <Space h="md" />

        <TableSkeleton isVisible={isLoading} />

        {!isLoading && (
          <>
            {seatingPlans?.docs.length === 0 ? (
              <Text c="dimmed" ta="center" mt="xl">
                {t('No seating plans found')}
              </Text>
            ) : (
              <Table
                columns={columns}
                dataSource={seatingPlans?.docs}
                rowKey="id"
                pagination={{
                  current: Number(searchParams.page) || 1,
                  pageSize: Number(searchParams.limit) || 10,
                  total: seatingPlans?.totalDocs,
                  onChange: (page) =>
                    setSearchParams({ ...searchParams, page: page.toString() }),
                }}
              />
            )}
          </>
        )}
      </PageBody>
    </div>
  );
};

export default EventSeatingPlans;
