import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface TicketHeaderProps {}

export const TicketHeader: React.FC<TicketHeaderProps> = () => {
  const { t } = useTranslation();

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <Title>{t('checkout.orderInformation')}</Title>
        <ResetButton>{t('checkout.chooseTicketAgain')}</ResetButton>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.div`
  display: flex;
  width: 100%;
  padding-bottom: 3px;
  flex-direction: column;
  line-height: 1;
  justify-content: start;
`;

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 15px;
  color: #000000;
  font-weight: 600;
  margin: 0;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: blue;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
`;
