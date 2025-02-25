import React from "react";
import styled from "styled-components";

interface EventCardProps {
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

export const EventCard: React.FC<EventCardProps> = ({
  image,
  category,
  date,
  title,
  venue,
  time,
  price,
  interestedCount,
  isOnline,
}) => {
  return (
    <CardWrapper>
      <ImageSection>
        <EventImage src={image} alt={title} />
        <IconsWrapper>
          <LikeIcon
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/dd0228e7335be2719c173e6ec897a6265ae0169d5a0cd4a92797d2ff2b201599"
            alt="Share"
          />
        </IconsWrapper>
        <CategoryBadge>{category}</CategoryBadge>
      </ImageSection>

      <ContentWrapper>
        <DateSection>
          <Month>{date.month}</Month>
          <Day>{date.day}</Day>
        </DateSection>

        <EventDetails>
          <Title>{title}</Title>
          <Location>{isOnline ? "Online" : venue}</Location>
          <Time>{time}</Time>

          <MetaInfo>
            <PriceSection>
              <PriceIcon
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/d198ef5003a289d349feddc2bc0bee4f964a18a43808d66ec3799b06d8c33806"
                alt="Price"
              />
              <Price>{price}</Price>
            </PriceSection>

            <InterestedSection>
              <InterestedIcon
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/0652e1d7fb40fc37b6a2cdc0af2f3f40dda735dfda3afea7ff55ead5950cc291"
                alt="Interested"
              />
              <InterestedCount>{interestedCount} interested</InterestedCount>
            </InterestedSection>
          </MetaInfo>
        </EventDetails>
      </ContentWrapper>
    </CardWrapper>
  );
};

const CardWrapper = styled.article`
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  min-width: 240px;
  padding-bottom: 18px;
  flex-direction: column;
  overflow: hidden;
  flex-grow: 1;
  flex-shrink: 1;
  width: 410px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const ImageSection = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  overflow: hidden;
`;

const EventImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: rgba(185, 185, 185, 1);
`;

const IconsWrapper = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 1;
`;

const LikeIcon = styled.img`
  aspect-ratio: 1.36;
  object-fit: contain;
  width: 48px;
  fill: #fff;
`;

const CategoryBadge = styled.span`
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

const CountryBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  border-radius: 5px;
  background-color: #2b293d;
  padding: 2px 10px;
  color: #010101;
  font-family:
    Open Sans,
    sans-serif;
  font-size: 20px;
  font-weight: 600;
  z-index: 1;
`;

const ContentWrapper = styled.div`
  align-self: center;
  display: flex;
  margin-top: 18px;
  width: 453px;
  max-width: 100%;
  align-items: stretch;
  gap: 31px;
`;

const DateSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Montserrat, sans-serif;
  text-align: center;
`;

const Month = styled.span`
  color: #000001;
  font-size: 24px;
  font-weight: 600;
`;

const Day = styled.span`
  color: #000000;
  font-size: 26px;
  font-weight: 700;
  margin-top: 6px;
`;

const EventDetails = styled.div`
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

const Title = styled.h3`
  font-size: 24px;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Location = styled.p`
  margin-top: 10px;
`;

const Time = styled.time`
  font-weight: 400;
  text-transform: uppercase;
  margin-top: 10px;
`;

const MetaInfo = styled.div`
  display: flex;
  margin-top: 10px;
  align-items: center;
  gap: 9px;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const PriceIcon = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  width: 22px;
`;

const Price = styled.span`
  white-space: nowrap;
`;

const InterestedSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InterestedIcon = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  width: 21px;
  border-radius: 1px;
`;

const InterestedCount = styled.span`
  white-space: nowrap;
`;
