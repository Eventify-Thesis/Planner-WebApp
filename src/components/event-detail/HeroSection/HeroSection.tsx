import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from 'react-i18next';
import * as S from './HeroSection.styles';
import './HeroSection.styles.css';

interface HeroSectionProps {
  event: {
    title: string;
    date: string;
    venue: string;
    address: string;
    price: string;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({ event }) => {
  const { t } = useTranslation();
  const { isTablet, isDesktop } = useResponsive();
  const { title, date, venue, address, price } = event;

  const desktopLayout = (
    <S.HeroSectionWrapper>
      <S.EventContent>
        <div id="circle1" className="circle"></div>
        <div id="circle2" className="circle"></div>
        <S.EventInfo>
          <S.EventTitle>{title}</S.EventTitle>
          <S.EventDate>
            <S.IC icon="mdi:calendar" width="24" height="24" />
            {date}
          </S.EventDate>
          <S.VenueInfo>
            <S.IC icon="mdi:map-marker" width="24" height="24" />
            <S.VenueName>{venue}</S.VenueName>
          </S.VenueInfo>
          <S.Address>{address}</S.Address>
        </S.EventInfo>
        <S.PriceSection>
          <S.PriceInfo>
            <S.PriceLabel>{t('eventDetailPage.priceFrom')}</S.PriceLabel>
            <S.Price>{price}</S.Price>
          </S.PriceInfo>
          <S.BuyTicketButton>
            {t('eventDetailPage.buyTicket')}
          </S.BuyTicketButton>
        </S.PriceSection>
      </S.EventContent>
      <div id="img-wrapper-banner">
        <S.EventImage
          src="https://salt.tkbcdn.com/ts/ds/3b/46/bd/ed98627eac28dbc62a3246764a0d68a9.jpg"
          alt="Event banner"
        />
      </div>
    </S.HeroSectionWrapper>
  );

  const mobileAndTabletLayout = <S.HeroSectionWrapper></S.HeroSectionWrapper>;

  return <>{isDesktop ? desktopLayout : mobileAndTabletLayout}</>;
};
