import React from 'react';
import styled from 'styled-components';
import { EventInfo } from './EventInfo';
import { CountdownTimer } from './CountdownTimer';

interface EventDetailsProps {
  title: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  eventImage: string;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  title,
  venue,
  address,
  date,
  time,
  eventImage,
}) => {
  return (
    <EventWrapper>
      <ContentContainer>
        <EventInfo
          title={title}
          venue={venue}
          address={address}
          date={date}
          time={time}
        />
        <CountdownTimer />
      </ContentContainer>
    </EventWrapper>
  );
};

const EventWrapper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding-inline: 1.5rem;
  background: url('https://salt.tkbcdn.com/ts/ds/99/38/15/19919dffe776b8990327c2c461750391.jpg')
    center center / cover no-repeat;
  backdrop-filter: blur(1.5rem) brightness(0.6);
`;

const ContentContainer = styled.div`
  display: flex;
  min-height: 216px;
  width: 100%;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 1.5rem 16rem;
  backdrop-filter: blur(1.5rem) brightness(0.6);
`;
