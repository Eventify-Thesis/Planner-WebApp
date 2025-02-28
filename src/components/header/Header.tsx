import React from 'react';
import { DesktopHeader } from './layouts/DesktopHeader';
import { MobileHeader } from './layouts/MobileHeader';
import { useResponsive } from '@/hooks/useResponsive';

interface HeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
  eventName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  toggleSider,
  isSiderOpened,
  eventName,
}) => {
  const { isTablet } = useResponsive();

  return isTablet ? (
    <DesktopHeader eventName={eventName} />
  ) : (
    <MobileHeader toggleSider={toggleSider} isSiderOpened={isSiderOpened} />
  );
};
