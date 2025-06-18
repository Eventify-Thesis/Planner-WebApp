import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { EventDetailHeader } from '../EventDetailHeader/EventDetailHeader';
import { EventDetailSider } from '../EventDetailSider/EventDetailSider';
import * as S from './EventDetailLayout.styles';
import { useAuth } from '@clerk/clerk-react';
import { MainHeader } from '../../main/MainHeader/MainHeader';
import { Header } from '@/components/header/Header';
import { useResponsive } from '@/hooks/useResponsive';

interface EventDetailLayoutProps {
  eventName: string;
}

// Simple context to share sider state
interface SiderContextType {
  siderCollapsed: boolean;
}

const SiderContext = createContext<SiderContextType>({ siderCollapsed: false });

export const useSiderState = () => useContext(SiderContext);

export const EventDetailLayout: React.FC<EventDetailLayoutProps> = ({
  eventName,
}) => {
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const { mobileOnly, tabletOnly } = useResponsive();
  const toggleSider = () => setSiderCollapsed(!siderCollapsed);
  const { isLoaded } = useAuth();

  // Auto-collapse sider on mobile/tablet screens for better UX
  useEffect(() => {
    if (mobileOnly) {
      setSiderCollapsed(true);
    }
  }, [mobileOnly]);

  if (!isLoaded) return null;

  return (
    <SiderContext.Provider value={{ siderCollapsed }}>
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
    </SiderContext.Provider>
  );
};
