import React from "react";
import styled from "styled-components";
import * as s from "./EventCard.styles"

export const EventCard: React.FC<s.EventCardProps> = ({
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
    <s.CardWrapper>
      <s.ImageSection>
        <s.EventImage src={image} alt={title} />
        <s.IconsWrapper>
          <s.LikeIcon
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/dd0228e7335be2719c173e6ec897a6265ae0169d5a0cd4a92797d2ff2b201599"
            alt="Share"
          />
        </s.IconsWrapper>
        <s.CategoryBadge>{category}</s.CategoryBadge>
      </s.ImageSection>

      <s.ContentWrapper>
        <s.DateSection>
          <s.Month>{date.month}</s.Month>
          <s.Day>{date.day}</s.Day>
        </s.DateSection>

        <s.EventDetails>
          <s.Title>{title}</s.Title>
          <s.Location>{isOnline ? "Online" : venue}</s.Location>
          <s.Time>{time}</s.Time>

          <s.MetaInfo>
            <s.PriceSection>
              <s.PriceIcon
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/d198ef5003a289d349feddc2bc0bee4f964a18a43808d66ec3799b06d8c33806"
                alt="Price"
              />
              <s.Price>{price}</s.Price>
            </s.PriceSection>

            <s.InterestedSection>
              <s.InterestedIcon
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/0652e1d7fb40fc37b6a2cdc0af2f3f40dda735dfda3afea7ff55ead5950cc291"
                alt="Interested"
              />
              <s.InterestedCount>{interestedCount} interested</s.InterestedCount>
            </s.InterestedSection>
          </s.MetaInfo>
        </s.EventDetails>
      </s.ContentWrapper>
    </s.CardWrapper>
  );
};

