import React from 'react';
import { ProfileDropdown } from '../components/profileDropdown/ProfileDropdown/ProfileDropdown';
import { HeaderSearch } from '../components/HeaderSearch/HeaderSearch';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import * as S from '../Header.styles';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { Logo } from '../components/Logo/Logo';
import { UserButton } from '@clerk/clerk-react';
interface DesktopHeaderProps {}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({}) => {
  const leftSide = (
    <S.SearchColumn xl={12} xxl={14}>
      <BaseRow justify="space-between">
        <BaseCol xl={9} xxl={12}>
          <Logo />
        </BaseCol>
        <BaseCol
          xl={15}
          xxl={12}
          style={{
            paddingBlock: '0.5rem',
          }}
        >
          <HeaderSearch />
        </BaseCol>
      </BaseRow>
    </S.SearchColumn>
  );

  return (
    <BaseRow
      justify="space-between"
      align="middle"
      style={{
        height: '100%',
      }}
    >
      {leftSide}
      <BaseCol>
        <S.CEButton />
      </BaseCol>

      <S.ProfileColumn
        xl={8}
        xxl={7}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          height: '100%',
        }}
      >
        <BaseRow align="middle" justify="end" gutter={[4, 4]}>
          <S.NavRow gutter={[12, 0]} align="middle">
            <S.NavItem>
              <S.NavIcon icon="ion:ticket-outline" />
              Tickets
            </S.NavItem>
            <S.NavItem>
              <S.NavIcon icon="teenyicons:star-outline" />
              Interested
            </S.NavItem>
            <BaseCol>
              <UserButton showName={true} appearance={{}} />
            </BaseCol>
          </S.NavRow>
          <BaseCol>
            <BaseRow gutter={[{ xxl: 5 }, { xxl: 5 }]}>
              <BaseCol>
                <SettingsDropdown />
              </BaseCol>
            </BaseRow>
          </BaseCol>
        </BaseRow>
      </S.ProfileColumn>
    </BaseRow>
  );
};
