import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export const CountdownTimer: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();

  return (
    <TimerWrapper>
      <TimerContainer>
        <TimerLabel>{t('checkout.finishOrderIn')}</TimerLabel>
        <TimerDisplay>
          <TimeUnit>
            <TimeValue>14</TimeValue>
            <Separator>:</Separator>
          </TimeUnit>
          <TimeValue>34</TimeValue>
        </TimerDisplay>
      </TimerContainer>
    </TimerWrapper>
  );
};

const TimerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  justify-content: center;
  width: 11.875rem;
  height: 100%;
`;

const TimerContainer = styled.div`
  justify-content: center;
  border-radius: 36px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.25);
  display: flex;
  width: 100%;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  padding: 33px 1px 34px;
`;

const TimerLabel = styled.div`
  width: 100%;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  line-height: 16px;
  padding: 0 24px;
  @media (max-width: 991px) {
    padding: 0 20px;
  }
`;

const TimerDisplay = styled.div`
  display: flex;
  margin-top: 20px;
  width: 100%;
  align-items: center;
  font-weight: 700;
  white-space: nowrap;
  line-height: 1;
  justify-content: center;
  padding: 0 18px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const TimeUnit = styled.div`
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const TimeValue = styled.div`
  align-self: stretch;
  border-radius: 20px;
  background-color: #2dc275;
  min-height: 64px;
  font-size: 21px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const Separator = styled.div`
  align-self: stretch;
  font-size: 25px;
  margin: auto 0;
  padding: 0 8px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
