import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { useResponsive } from '@/hooks/useResponsive';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import FilterBar from '@/components/event-dashboard/filter/FilterBar';
import EventList from '@/components/event-dashboard/EventList/EventList';
import { EventStatus } from '@/constants/enums/event';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { BasePagination } from '@/components/common/BasePagination/BasePagination';
import { useGetEventList } from '@/queries/useEventQueries';
import { Spin } from 'antd';

const EventDashboardPage: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spin size="large" />
        </div>
      );
    }

    return (
      <>
        <EventList events={events} />
        <BaseCol span={12}>
          {events && events.length > 0 && (
            <BasePagination
              current={currentPage}
              pageSize={pageSize}
              total={totalDocs}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showSizeChanger
              style={{ marginTop: '24px', textAlign: 'center' }}
            />
          )}
        </BaseCol>
      </>
    );
  };

  const commonLayout = (
    <BaseRow
      align="middle"
      gutter={[10, 10]}
      style={{
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <FilterBar
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
      />
      {renderContent()}
    </BaseRow>
  );

  return (
    <>
      <PageTitle>{t('eventDashboardPage.title')}</PageTitle>
      {commonLayout}
    </>
  );
};

export default EventDashboardPage;
