import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface TicketDetailsProps {}

export const TicketDetails: React.FC<TicketDetailsProps> = () => {
  const { t } = useTranslation();
  return (
    <DetailsWrapper>
      <DetailsHeader>
        <TicketType>{t('checkout.ticketType')}</TicketType>
        <Quantity>{t('checkout.quantity')}</Quantity>
      </DetailsHeader>
      <TicketItem>
        <TicketName>SKY LOUNGE 2 (SEATING)</TicketName>
        <TicketQuantity>01</TicketQuantity>
      </TicketItem>
      <PriceInfo>
        <UnitPrice>8.000.000 đ</UnitPrice>
        <TotalPrice>8.000.000 đ</TotalPrice>
      </PriceInfo>
      <Divider />
    </DetailsWrapper>
  );
};

const DetailsWrapper = styled.div`
  display: flex;
  margin-top: 16px;
  width: 100%;
  flex-direction: column;
`;

const DetailsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #000000;
  font: 700 14px/1 Inter, sans-serif;
`;

const TicketType = styled.span``;

const Quantity = styled.span`
  text-align: right;
`;

const TicketItem = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: #000000;
  text-transform: capitalize;
  font: 13px/1 Inter, sans-serif;
  margin-top: 15px;
`;

const TicketName = styled.span`
  font-weight: 400;
`;

const TicketQuantity = styled.span`
  font-weight: 100;
  text-align: right;
`;

const PriceInfo = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  color: #000000;
  font: 100 13px/1 Inter, sans-serif;
`;

const UnitPrice = styled.span``;

const TotalPrice = styled.span`
  text-align: right;
`;

const Divider = styled.hr`
  border: none;
  border-bottom: 1px dashed var(--color-grey-67, #a6a6b0);
  margin: 8px 0 0;
`;
