import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { useResponsive } from '@/hooks/useResponsive';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import FilterBar from '@/components/event-dashboard/filter/FilterBar';
import EventList from '@/components/event-dashboard/EventList/EventList';
import { EventStatus } from '@/constants/enums/event';
import { EventListAllResponse } from '@/dto/event-doc.dto';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { getEventList } from '@/store/slices/eventSlice';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { BasePagination } from '@/components/common/BasePagination/BasePagination';

const EventDashboardPage: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [events, setEvents] = useState<EventListAllResponse[]>([]);
  const [totalDocs, setTotalDocs] = useState<number>(0);

  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(EventStatus.UPCOMING.toString());

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      getEventList({
        keyword,
        status,
        page: currentPage,
        limit: pageSize,
      }),
    )
      .unwrap()
      .then((data) => {
        if (data) {
          setTotalDocs(data.totalDocs);
          setEvents(data.docs);
        }
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
      });
  }, [keyword, status, currentPage, pageSize, dispatch]);

  const desktopLayout = (
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
    </BaseRow>
  );

  const mobileAndTabletLayout = (
    <>
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
      </BaseRow>
    </>
  );
  return (
    <>
      <PageTitle>{t('eventDashboardPage.title')}</PageTitle>
      {isDesktop ? desktopLayout : mobileAndTabletLayout}
    </>
  );
};

export default EventDashboardPage;
