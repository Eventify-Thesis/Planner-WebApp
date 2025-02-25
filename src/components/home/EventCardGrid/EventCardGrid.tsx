"use client";
import React from "react";
import styled from "styled-components";
import { EventCardProps } from "./EventCard/EventCard.styles";
import { EventCard } from "../EventCard";
import { SeeMoreButton } from "./SeeMoreButton/SeeMoreButton.styles";
const Section = styled.section`
  margin-top: 60px;
  padding: 0 100px;
  width: 100%;
  max-width: 1926px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 991px) {
    margin-top: 40px;
    padding: 0 20px;
  }
`;

const Title = styled.h2`
  color: #000000;
  font-family: Montserrat, sans-serif;
  font-size: 20px;
  font-weight: 700;
  align-self: flex-start; /* Aligns the title to the left */
  margin-left: 10px; /* Adjust as needed for alignment */

  @media (max-width: 991px) {
    margin-top: 13px;
  }
`;

const EventsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px; /* Reduce gap for better spacing */
  margin-top: 40px;

  @media (min-width: 1480px) {
    justify-content: flex-start; /* Align cards better on large screens */
  }

  @media (max-width: 991px) {
    justify-content: center; /* Center align on smaller screens */
  }
`;


interface EventCardGridProps {
    eventCategory: string,
    events: EventCardProps[];
}

export const EventCardGrid: React.FC<EventCardGridProps> = ({eventCategory, events }) => {
    return (
        <Section>
        <Title>{eventCategory}</Title>
        <EventsGrid>
            {events.map((event, index) => (
            <EventCard key={index} {...event} />
            ))}
        </EventsGrid>

        <SeeMoreButton>See More</SeeMoreButton>

        </Section>
    );
};
