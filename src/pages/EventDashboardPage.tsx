import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { useResponsive } from '@/hooks/useResponsive';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';

const EventDashboardPage: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();
  
  const desktopLayout = (
    <BaseRow align="middle" gutter={[10, 10]} style={{ width: '100%' }}>
   
    </BaseRow>
  );

  const mobileAndTabletLayout = <></>;
  return (
    <>
      <PageTitle>{t('eventDashboardPage.title')}</PageTitle>
      {isDesktop ? desktopLayout : mobileAndTabletLayout}
    </>
  );
};


export default EventDashboardPage;
