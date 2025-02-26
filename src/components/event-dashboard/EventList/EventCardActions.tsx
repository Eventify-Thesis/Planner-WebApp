import { Icon } from '@iconify/react/dist/iconify.js';
import { useTranslation } from 'react-i18next';
import React from 'react';
import styled from 'styled-components';

import { useResponsive } from '@/hooks/useResponsive';

export const EventCardActions = () => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  return (
    <ActionsContainer>
      <ActionItem>
        <ActionLink isMobile={isMobile}>
          <Icon icon="mdi:home" width="24" height="24" />
          {!isMobile && <ActionText>{t('eventDashboard.overview')}</ActionText>}
        </ActionLink>
      </ActionItem>
      <ActionItem>
        <ActionLink isMobile={isMobile}>
          <Icon icon="material-symbols:person" width="24" height="24" />
          {!isMobile && <ActionText>{t('eventDashboard.members')}</ActionText>}
        </ActionLink>
      </ActionItem>
      <ActionItem>
        <ActionLink isMobile={isMobile}>
          <Icon icon="mdi:cart" width="24" height="24" />
          {!isMobile && <ActionText>{t('eventDashboard.orders')}</ActionText>}
        </ActionLink>
      </ActionItem>
      <ActionItem>
        <ActionLink isMobile={isMobile}>
          <Icon icon="mdi:chair" width="24" height="24" />
          {!isMobile && <ActionText>{t('eventDashboard.seating')}</ActionText>}
        </ActionLink>
      </ActionItem>
      <ActionItem>
        <ActionLink isMobile={isMobile}>
          <Icon icon="mdi:cog" width="24" height="24" />
          {!isMobile && <ActionText>{t('eventDashboard.edit')}</ActionText>}
        </ActionLink>
      </ActionItem>
    </ActionsContainer>
  );
};

// Update ActionLink styling
interface ActionLinkProps {
  isMobile: boolean;
}
const ActionLink = styled.a<ActionLinkProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  width: 100%;
  gap: ${({ isMobile }) => (isMobile ? '0' : '8px')};
`;

const ActionsContainer = styled.nav`
  justify-content: center;
  align-items: center;
  border-top: 0.667px solid rgba(255, 255, 255, 0.15);
  background-color: #414652;
  display: flex;
  width: 100%;
  padding: 5px 301px 4px;
  flex-wrap: wrap;
  @media (max-width: 991px) {
    max-width: 100%;
    padding-left: 20px;
    padding-right: 20px;
  }

  && {
    svg {
      color: white;
    }
  }
`;

const ActionItem = styled.div`
  align-self: stretch;
  position: relative;
  display: flex;
  margin: auto 0;
  padding: 0 16px;
  flex-direction: column;
  justify-content: start;
  flex: 1;

  &:not(:last-child)::after {
    content: '';
    background-color: rgba(5, 5, 5, 0.06);
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 14px;
  }
`;

const ActionText = styled.span`
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  color: #c4c4cf;
  font-weight: 400;
  text-align: center;
  line-height: 2;
`;
