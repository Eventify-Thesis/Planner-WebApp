import styled from 'styled-components';

export interface EventCardProps {
  image: string;
  category: string;
  date: {
    month: string;
    day: string;
  };
  title: string;
  venue: string;
  time: string;
  price: string;
  interestedCount: number;
  isOnline?: boolean;
}

export const CardWrapper = styled.article`
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-grow: 1;
  flex-shrink: 1;
  width: 300px; /* Make the card smaller */
  max-width: 100%;
  padding-bottom: 18px;
  padding: 0 10px;

  @media (max-width: 1480px) {
    width: 260px; /* Adjust for smaller screens */
  }

  @media (max-width: 991px) {
    width: 100%; /* Full width on mobile */
    max-width: 80%;
  }
`;


export const ImageSection = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;
`;

export const EventImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: rgba(185, 185, 185, 1);
`;

export const IconsWrapper = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 1;
`;

export const LikeIcon = styled.img`
  aspect-ratio: 1.36;
  object-fit: contain;
  width: 48px;
  fill: #fff;
`;

export const CategoryBadge = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 0px 6px 0px 0px;
  background-color: #ffe047;
  padding: 5px 10px;
  font-family:
    Open Sans,
    sans-serif;
  font-size: 18px;
  color: #000000;
  font-weight: 600;
  z-index: 1;
`;

export const ContentWrapper = styled.div`
  align-self: center;
  display: flex;
  margin-top: 18px;
  width: 453px;
  max-width: 100%;
  align-items: stretch;
  gap: 31px;
`;

export const DateSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Montserrat, sans-serif;
  text-align: center;
`;

export const Month = styled.span`
  color: #000001;
  font-size: 24px;
  font-weight: 600;
`;

export const Day = styled.span`
  color: #000000;
  font-size: 26px;
  font-weight: 700;
  margin-top: 6px;
`;

export const EventDetails = styled.div`
  display: flex;
  flex-direction: column;
  font-family:
    Open Sans,
    sans-serif;
  font-size: 18px;
  color: #000000;
  font-weight: 600;
  flex-grow: 1;
`;

export const Title = styled.h3`
  font-size: 24px;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Location = styled.p`
  margin-top: 10px;
`;

export const Time = styled.time`
  font-weight: 400;
  text-transform: uppercase;
  margin-top: 10px;
`;

export const MetaInfo = styled.div`
  display: flex;
  margin-top: 10px;
  align-items: center;
  gap: 9px;
`;

export const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

export const PriceIcon = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  width: 22px;
`;

export const Price = styled.span`
  white-space: nowrap;
`;

export const InterestedSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const InterestedIcon = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  width: 21px;
  border-radius: 1px;
`;

export const InterestedCount = styled.span`
  white-space: nowrap;
`;
