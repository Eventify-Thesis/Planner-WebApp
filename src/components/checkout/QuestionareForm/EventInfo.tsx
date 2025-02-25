import { Icon } from '@iconify/react/dist/iconify.js';
import React from 'react';
import styled from 'styled-components';

interface EventInfoProps {
  title: string;
  venue: string;
  address: string;
  date: string;
  time: string;
}

export const EventInfo: React.FC<EventInfoProps> = ({
  title,
  venue,
  address,
  date,
  time,
}) => {
  return (
    <EventInfoWrapper>
      <EventTitle>{title}</EventTitle>
      <Separator />
      <VenueInfo>
        <Icon icon="bytesize:location" width="17" height="17" />
        <VenueName>{venue}</VenueName>
      </VenueInfo>
      <EventAddress>{address}</EventAddress>
      <EventDateTime>
        <Icon icon="lucide:calendar" width="17" height="17" />
        <DateTimeText>{`${time}, ${date}`}</DateTimeText>
      </EventDateTime>
    </EventInfoWrapper>
  );
};

const EventInfoWrapper = styled.div`
  display: flex;
  min-width: 240px;
  padding-bottom: 27px;
  flex-direction: column;
  flex: 1;
  flex-basis: 0%;
  @media (max-width: 991px) {
    max-width: 100%;
  }
  color: white;
`;

const EventTitle = styled.h1`
  overflow: hidden;
  font: 600 24px/1 Montserrat, sans-serif;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const Separator = styled.hr`
  border: 1px solid rgba(255, 255, 255, 0.5);
  margin: 16px 0;
  width: 100%;
`;

const VenueInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  color: white;
  padding: 4px 0;
  font: 500 15px/1 Montserrat, sans-serif;
`;

const VenueName = styled.span`
  align-self: stretch;
  font: 500 14px/1 Montserrat, sans-serif;
`;

const EventAddress = styled.p`
  margin-left: 28px;
  color: white;
  font: 500 14px/1 Montserrat, sans-serif;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const EventDateTime = styled.div`
  display: flex;
  margin-top: 1rem;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-transform: capitalize;
  font: 500 14px/1 Montserrat, sans-serif;
`;

const DateTimeText = styled.span`
  align-self: stretch;
  color: white;
`;
