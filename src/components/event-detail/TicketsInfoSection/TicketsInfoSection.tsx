import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import * as S from './TicketsInfoSection.styles';
import './TicketsInfoSection.styles.css';

export const TickerInfoSection: React.FC = () => {
  const { t } = useTranslation();
  const { isTablet, isDesktop } = useResponsive();

  const items = [
    {
      key: '1',
      label: 'General Admission',
      children: 'This is the general admission ticket',
      extra: (
        <S.BuyTicketButton>{t('eventDetailPage.buyTicket')}</S.BuyTicketButton>
      ),
    },
    {
      key: '2',
      label: 'VIP',
      children: 'This is the VIP ticket',
      extra: (
        <S.BuyTicketButton>{t('eventDetailPage.buyTicket')}</S.BuyTicketButton>
      ),
    },
    {
      key: '3',
      label: 'VVIP',
      children: 'This is the VVIP ticket',
      extra: (
        <S.BuyTicketButton>{t('eventDetailPage.buyTicket')}</S.BuyTicketButton>
      ),
    },
  ];

  const desktopLayout = (
    <S.TicketInfoWrapper>
      <S.TicketInfoHeader>{t('eventDetailPage.ticketInfo')}</S.TicketInfoHeader>
      <S.TicketsList defaultActiveKey={['1']} items={items}></S.TicketsList>
    </S.TicketInfoWrapper>
  );

  const mobileAndTabletLayout = <></>;
  return <>{isDesktop ? desktopLayout : mobileAndTabletLayout}</>;
};
