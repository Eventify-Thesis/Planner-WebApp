import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/common/PageTitle/PageTitle';
import { useResponsive } from '@/hooks/useResponsive';
import { HeroSection } from '@/components/event-detail/HeroSection/HeroSection';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { DescriptionSection } from '@/components/event-detail/DescriptionSection/DescriptionSection';
import { TickerInfoSection } from '@/components/event-detail/TicketsInfoSection/TicketsInfoSection';
import { OrganizerInfoSection } from '@/components/event-detail/OrganizerInfoSection/OrganizerInfoSection';
import styled from 'styled-components';
import { LAYOUT, media } from '@/styles/themes/constants';

const EventDetailPage: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();
  const exampleEvent = {
    title: 'Sự kiện tháng 10',
    date: '10/10/2021',
    venue: 'Sân vận động Quốc gia Mỹ Đình',
    address: 'Đường Lê Đức Thọ, Mỹ Đình, Nam Từ Liêm, Hà Nội',
    price: '500.000đ',
    organizerName: 'Công ty TNHH ABC',
    organizerImage: 'https://cdn-icons-png.freepik.com/512/219/219964.png',
    organizerDescription: 'Công ty ABC chuyên tổ chức sự kiện lớn nhỏ',
  };

  const desktopLayout = (
    <BaseRow align="middle" gutter={[10, 10]} style={{ width: '100%' }}>
      <Banner>
        <HeroSection event={exampleEvent} />
      </Banner>
      <MainInfoSection>
        <DescriptionSection />
        <TickerInfoSection />
        <OrganizerInfoSection
          organizerDescription={exampleEvent.organizerDescription}
          organizerName={exampleEvent.organizerName}
          organizerImage={exampleEvent.organizerImage}
        />
      </MainInfoSection>
    </BaseRow>
  );

  const mobileAndTabletLayout = <HeroSection event={exampleEvent} />;

  return (
    <>
      <PageTitle>{exampleEvent.title}</PageTitle>
      {isDesktop ? desktopLayout : mobileAndTabletLayout}
    </>
  );
};

const Banner = styled.div`
  width: 100%;
  padding-block: 2rem;
  padding-inline: 1rem;
  display: flex;
  background: linear-gradient(rgb(39, 39, 42) 48.04%, rgb(0, 0, 0) 100%);
  color: rgb(255, 255, 255);
`;
export const MainInfoSection = styled.div`
  padding: 0rem 8rem;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 75%;

  @media only screen and ${media.md} {
    padding: 0rem 8rem;
  }
`;

export default EventDetailPage;
