import React from 'react';
import styled from 'styled-components';
import { OrganizerCard } from './OrganizerCard';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from 'react-i18next';

interface OrganizerInfoProps {
  organizerName: string;
  organizerDescription: string;
  organizerImage: string;
}

export const OrganizerInfoSection: React.FC<OrganizerInfoProps> = ({
  organizerName,
  organizerDescription,
  organizerImage,
}) => {
  const { t } = useTranslation();
  const { isTablet, isDesktop } = useResponsive();

  const desktopLayout = (
    <OrganizerInfoWrapper>
      <OrganizerHeading>{t('eventDetailPage.organizer')}</OrganizerHeading>
      <OrganizerCard
        organizerName={organizerName}
        organizerDescription={organizerDescription}
        organizerImage={organizerImage}
      />
    </OrganizerInfoWrapper>
  );

  const mobileAndTabletLayout = <> </>;

  return <>{isDesktop ? desktopLayout : mobileAndTabletLayout}</>;
};

const OrganizerInfoWrapper = styled.section`
  border-radius: 12px;
  font-family: 'Montserrat', sans-serif;
  background-color: var(--ticketbox-vn-white, #fff);
  display: flex;
  margin-top: 25px;
  flex-direction: column;
  overflow: hidden;
  justify-content: start;
  padding: 0 16px 12px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const OrganizerHeading = styled.h2`
  border-bottom: var(--stroke-weight-1_33, 1.333px) solid
    var(--color-grey-93, #e6ebf5);
  width: 100%;
  color: #000000;
  padding: 11px 0 14px;
  font: 600 16px/1 Inter, sans-serif;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
