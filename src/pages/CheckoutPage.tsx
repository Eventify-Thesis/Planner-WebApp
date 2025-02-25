import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { useResponsive } from '@/hooks/useResponsive';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import ProgressBar from '@/components/checkout/ProgressBar/ProgressBar';
import styled from 'styled-components';
import { EventDetails } from '@/components/checkout/EventDetails/EventDetails';
import { QuestionnaireForm } from '@/components/checkout/QuestionnaireForm/QuestionnaireForm';

const EventDetailPage: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();

  const desktopLayout = (
    <>
      <ProgressRow style={{ width: '100%' }}>
        <ProgressBar />
      </ProgressRow>
      <BaseRow align="middle">
        <EventDetails
          title="Event Title"
          venue="Venue"
          address="Address"
          date="Date"
          time="Time"
          eventImage="https://images.unsplash.com/photo-1612838320302-4b3b3b3b3b3b"
        />
      </BaseRow>
      <QuestionnaireRow style={{ width: '100%' }}>
        <QuestionnaireForm />
      </QuestionnaireRow>
    </>
  );

  const mobileAndTabletLayout = <></>;

  return (
    <>
      <PageTitle>{t('eventDetailPage.title')}</PageTitle>
      {isDesktop ? desktopLayout : mobileAndTabletLayout}
    </>
  );
};

export default EventDetailPage;

const ProgressRow = styled(BaseRow)`
  background-color: rgb(39, 39, 42);
  margin-left: 0;
  margin-right: 0;
  height: 3.875rem;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
`;

const QuestionnaireRow = styled(BaseRow)`
  background-color: black;
  padding: 1.5rem 16rem;
  width: 100%;
`;
