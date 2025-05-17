import React, { useState } from 'react';
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
  Box
} from '@mantine/core';
import { createStyles } from '@mantine/styles';

// Define styles for the dashboard page
const useStyles = createStyles((theme: any) => ({
  container: {
    width: '100%',
    height: '100vh',
    padding: '0'
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

  const { t } = useTranslation();

  const { data, isLoading } = useGetEventList({
    keyword,
    status,
    page: currentPage,
    limit: pageSize,
  });

  const events = data?.docs || [];
  const totalDocs = data?.totalDocs || 0;

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
        <EventList events={events} />
        {events && events.length > 0 && (
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
      <PageTitle>{t('eventDashboardPage.title')}</PageTitle>
      
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
