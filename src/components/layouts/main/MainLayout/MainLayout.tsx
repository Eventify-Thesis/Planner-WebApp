import React, { useEffect, useState } from 'react';
import { Header } from '../../../header/Header';
import MainContent from '../MainContent/MainContent';
import { MainHeader } from '../MainHeader/MainHeader';
import * as S from './MainLayout.styles';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import MainSider from '../sider/MainSider/MainSider';

const MainLayout: React.FC = () => {
  const [siderCollapsed, setSiderCollapsed] = useState(true);
  const toggleSider = () => setSiderCollapsed(!siderCollapsed);
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;

  return (
    <S.LayoutMaster>
      <MainSider
        isCollapsed={siderCollapsed}
        setCollapsed={setSiderCollapsed}
      />
      <S.LayoutMain>
        <MainHeader>
          <Header toggleSider={toggleSider} isSiderOpened={!siderCollapsed} />
        </MainHeader>
        <MainContent id="main-content">
          <div>
            <Outlet />
          </div>
        </MainContent>
      </S.LayoutMain>
    </S.LayoutMaster>
  );
};

export default MainLayout;
