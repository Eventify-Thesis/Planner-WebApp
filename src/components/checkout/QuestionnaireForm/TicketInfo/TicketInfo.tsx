import React from 'react';
import styled from 'styled-components';
import { TicketHeader } from './TicketHeader';
import { TicketDetails } from './TicketDetails';
import { TicketSummary } from './TicketSummary';
import { ContinueButton } from './ContinueButton';

interface TicketInfoProps {}

export const TicketInfo: React.FC<TicketInfoProps> = () => {
  return (
    <TicketInfoWrapper>
      <TicketHeader />
      <TicketDetails />
      <TicketSummary />
      <ContinueButton />
    </TicketInfoWrapper>
  );
};

const TicketInfoWrapper = styled.div`
  border-radius: 12px;
  background-color: var(--ticketbox-vn-white, #fff);
  display: flex;
  max-width: 100%;
  width: 350px;
  flex-direction: column;
  justify-content: start;
  padding: 12px 16px;
`;
