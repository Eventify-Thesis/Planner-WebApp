import { BaseButton } from '@/components/common/BaseButton/BaseButton';
import { BASE_COLORS } from '@/styles/themes/constants';
import { Icon } from '@iconify/react/dist/iconify.js';
import styled, { css } from 'styled-components';

export const HeroSectionWrapper = styled.div`
  display: flex;
  position: relative;
  padding: 0rem 8rem;
  width: 100%;
  height: max-content;
  overflow: hidden;
  font-family: 'Montserrat', sans-serif;
`;

export const EventContent = styled.div`
  background-color: var(--color-grey-23, #38383d);
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  border-radius: 24px;
`;

export const EventInfo = styled.div`
  color: #010101;
  font: 700 12px;
`;

export const EventTitle = styled.h1`
  font-size: 20px;
  font-weight: 900;
  line-height: 30px;
  margin-bottom: 1rem;
  color: white;
`;

export const EventDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: ${BASE_COLORS['yellow']};
`;

export const IC = styled(Icon)`
  width: 21px;
  height: 20px;
  color: white;
`;

export const VenueInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const VenueName = styled.span`
  font-weight: 400;
  color: ${BASE_COLORS['yellow']};
`;

export const Address = styled.p`
  font-weight: 400;
  line-height: 1.125rem;
  margin-left: 1.5rem;
  color: rgb(196, 196, 207);
`;

export const PriceSection = styled.div`
  border-top: 1.333px solid var(--color-blue-79, #c4c4cf);
  padding-top: 15px;
`;

export const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 15px;
`;

export const PriceLabel = styled.span`
  font-size: 18px;
  color: white;
`;

export const Price = styled.span`
  font-size: 24px;
  color: ${BASE_COLORS['yellow']};
`;

/**
 * Button component for buying tickets.
 */
export const BuyTicketButton = styled(BaseButton)`
  width: 100%;
  background-color: ${BASE_COLORS['yellow']};
  color: white;
  text-align: center;
  font-weight: 700;
  padding: 7px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export const EventImage = styled.img`
  width: 100%;
  overflow-clip-margin: content-box;
  overflow: clip;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  border-left: 2px dashed rgb(39, 39, 42);
  border-top-right-radius: 24px 24px;
  border-bottom-right-radius: 24px 24px;
`;
