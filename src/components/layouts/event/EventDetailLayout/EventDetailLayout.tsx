import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EventDetailHeader } from '../EventDetailHeader/EventDetailHeader';
import { EventDetailSider } from '../EventDetailSider/EventDetailSider';
import * as S from './EventDetailLayout.styles';
import { useAuth } from '@clerk/clerk-react';
import { MainHeader } from '../../main/MainHeader/MainHeader';
import { Header } from '@/components/header/Header';

interface EventDetailLayoutProps {
  eventName: string;
}

export const EventDetailLayout: React.FC<EventDetailLayoutProps> = ({
  eventName,
}) => {
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const toggleSider = () => setSiderCollapsed(!siderCollapsed);
  const { isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <S.LayoutMaster>
      <EventDetailSider
        isCollapsed={siderCollapsed}
        setCollapsed={setSiderCollapsed}
      />
      <S.LayoutMain>
        <MainHeader>
          <Header
            eventName={eventName}
            toggleSider={toggleSider}
            isSiderOpened={!siderCollapsed}
          />
        </MainHeader>
        <S.MainContent>
          <div>
            <Outlet />
          </div>{' '}
        </S.MainContent>
      </S.LayoutMain>
    </S.LayoutMaster>
  );
};
