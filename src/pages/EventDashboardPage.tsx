import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { useResponsive } from '@/hooks/useResponsive';
import FilterBar from '@/components/event-dashboard/filter/FilterBar';
import EventList from '@/components/event-dashboard/EventList/EventList';
import { EventStatus } from '@/constants/enums/event';
import { useGetEventList } from '@/queries/useEventQueries';
import {
  Container,
  Paper,
  Pagination,
  Select,
  Loader,
  Center,
  Box,
} from '@mantine/core';
import { createStyles } from '@mantine/styles';

// Define styles for the dashboard page
const useStyles = createStyles((theme: any) => ({
  container: {
    width: '100%',
    height: '100vh',
    padding: '0',
  },

  paper: {
    backgroundColor: theme.colors.gray[0],
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.sm,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
}));

const EventDashboardPage: React.FC = () => {
  const { classes } = useStyles();
  const { isTablet } = useResponsive();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(EventStatus.UPCOMING.toString());

  // Reset to first page whenever status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [status]);

  const { t } = useTranslation();

  // Map UPCOMING and PAST filters to backend 'PUBLISHED' status
  const backendStatus =
    status === 'UPCOMING' || status === 'PAST' ? EventStatus.PUBLISHED : status as any;

  // For UPCOMING and PAST we want full published list to filter client-side
  const requestPage = status === 'UPCOMING' || status === 'PAST' ? 1 : currentPage;
  const requestLimit = status === 'UPCOMING' || status === 'PAST' ? 1000 : pageSize;

  const { data, isLoading } = useGetEventList({
    keyword,
    status: backendStatus,
    page: requestPage,
    limit: requestLimit,
  });

  const events = data?.docs || [];

  // Apply client-side date filtering for UPCOMING and PAST tabs
  const now = new Date();
  const filteredEventsAll = events.filter((event: any) => {
    if (status === 'UPCOMING') {
      return new Date(event.startTime) > now;
    }
    if (status === 'PAST') {
      return new Date(event.startTime) <= now;
    }
    return true;
  });
  // Slice for pagination when filtering client-side
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const sortedEventsAll = status === 'UPCOMING'
    ? filteredEventsAll.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    : status === 'PAST'
    ? filteredEventsAll.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    : filteredEventsAll;

  const displayEvents =
    status === 'UPCOMING' || status === 'PAST'
      ? sortedEventsAll.slice(startIdx, endIdx)
      : events;

  const totalDocs =
    status === 'UPCOMING' || status === 'PAST'
      ? filteredEventsAll.length
      : data?.totalDocs || 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <Center p="xl" h={300}>
          <Loader size="lg" />
        </Center>
      );
    }

    return (
      <div
        style={{
          marginTop: '1rem',
        }}
      >
        <EventList events={displayEvents} />
        {totalDocs > 0 && (
          <Box className={classes.paginationContainer}>
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={Math.ceil(totalDocs / pageSize)}
              size={isTablet ? 'md' : 'sm'}
              radius="md"
            />
            <Select
              value={pageSize.toString()}
              onChange={(value) => setPageSize(Number(value))}
              data={[
                { value: '5', label: '5 / page' },
                { value: '10', label: '10 / page' },
                { value: '20', label: '20 / page' },
                { value: '50', label: '50 / page' },
              ]}
              size="sm"
              style={{ width: 100 }}
            />
          </Box>
        )}
      </div>
    );
  };

  return (
    <div className={classes.container}>
      <PageTitle>Dashboard</PageTitle>

      <Paper className={classes.paper} withBorder>
        <FilterBar
          keyword={keyword}
          setKeyword={setKeyword}
          status={status}
          setStatus={setStatus}
        />
        {renderContent()}
      </Paper>
    </div>
  );
};

export default EventDashboardPage;
