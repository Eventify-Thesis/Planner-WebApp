import React from 'react';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import * as S from '../UnauthHeader.styles';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { BaseButton } from '@/components/common/BaseButton/BaseButton';
import { Logo } from '../components/Logo/Logo';
import { HeaderSearch } from '../components/HeaderSearch/HeaderSearch';
import { BASE_COLORS } from '@/styles/themes/constants';

interface DesktopUnauthHeaderProps {}

export const DesktopUnauthHeader: React.FC<DesktopUnauthHeaderProps> = ({}) => {
  const leftSide = (
    <S.SearchColumn xl={12} xxl={14}>
      <BaseRow justify="space-between">
        <BaseCol xl={9} xxl={12}>
          <Logo />
        </BaseCol>
        <BaseCol xl={15} xxl={12}>
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

      <S.ProfileColumn xl={8} xxl={7}>
        <BaseRow align="middle" justify="end" gutter={[5, 5]}>
          <BaseCol>
            <BaseRow gutter={[10, 10]}>
              <BaseCol>
                <S.LinkButton type="link" href="auth/login">
                  Login
                </S.LinkButton>
              </BaseCol>
              <BaseCol>
                <BaseButton
                  variant="solid"
                  href="auth/sign-up"
                  style={{
                    borderColor: 'transparent',
                    fontFamily: 'Montserrat',
                    backgroundColor: BASE_COLORS.yellow,
                  }}
                >
                  Sign Up
                </BaseButton>
              </BaseCol>
            </BaseRow>
          </BaseCol>
          <BaseCol>
            <SettingsDropdown />
          </BaseCol>
        </BaseRow>
      </S.ProfileColumn>
    </BaseRow>
  );
};
