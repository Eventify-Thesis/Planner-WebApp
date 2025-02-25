import React from 'react';
import styled from 'styled-components';

interface OrganizerCardProps {
  organizerName: string;
  organizerImage: string;
  organizerDescription: string;
}

export const OrganizerCard: React.FC<OrganizerCardProps> = ({
  organizerName,
  organizerImage,
  organizerDescription,
}) => {
  return (
    <CardContainer>
      <ImageWrapper>
        <OrganizerImage
          src={organizerImage}
          alt={organizerName}
          loading="lazy"
        />
      </ImageWrapper>
      <OrganizerDetails>
        <OrganizerName>{organizerName}</OrganizerName>
        <OrganizerDescription>{organizerDescription}</OrganizerDescription>
      </OrganizerDetails>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  display: flex;
  min-height: 9rem;
  margin-top: 2.25rem;
  width: 100%;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const ImageWrapper = styled.div`
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 117px;
`;

const OrganizerImage = styled.img`
  aspect-ratio: 0.97;
  object-fit: contain;
  object-position: center;
  width: 146px;
`;

const OrganizerDetails = styled.div`
  display: flex;
  min-width: 240px;
  flex-direction: column;
  font-family: Inter, sans-serif;
  color: #000000;
  justify-content: start;
  flex-grow: 1;
  width: 705px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const OrganizerName = styled.h3`
  line-height: var(--line-height-27, 27px);
  width: 100%;
  font-size: 18px;
  font-weight: 700;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const OrganizerDescription = styled.p`
  line-height: var(--line-height-21, 21px);
  width: 100%;
  padding-bottom: 1px;
  font-size: 14px;
  font-weight: 400;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
