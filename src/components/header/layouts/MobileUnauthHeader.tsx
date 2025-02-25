import React from 'react';
import { ProfileDropdown } from '../components/profileDropdown/ProfileDropdown/ProfileDropdown';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import * as S from '../UnauthHeader.styles';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';

interface MobileUnauthHeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
}

export const MobileUnauthHeader: React.FC<MobileUnauthHeaderProps> = ({
  toggleSider,
  isSiderOpened,
}) => {
  return (
    <BaseRow justify="space-between" align="middle">
      <BaseCol>
        <ProfileDropdown />
      </BaseCol>

      <BaseCol>
        <BaseRow align="middle">
          <BaseCol>{/* <UnauthHeaderSearch /> */}</BaseCol>

          <BaseCol>{/* <SettingsDropdown /> */}</BaseCol>
        </BaseRow>
      </BaseCol>

      <S.BurgerCol>
        <S.MobileBurger onClick={toggleSider} isCross={isSiderOpened} />
      </S.BurgerCol>
    </BaseRow>
  );
};
