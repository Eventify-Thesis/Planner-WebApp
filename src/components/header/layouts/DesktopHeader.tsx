import React from 'react';
import { HeaderSearch } from '../components/HeaderSearch/HeaderSearch';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import * as S from '../Header.styles';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { UserButton } from '@clerk/clerk-react';
interface DesktopHeaderProps {}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({}) => {
  const leftSide = <h1> Logo </h1>;

  return (
    <BaseRow
      justify="space-between"
      align="middle"
      style={{
        height: '100%',
      }}
    >
      {leftSide}
      <S.ProfileColumn
        xl={8}
        xxl={7}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          height: '100%',
        }}
      >
        <BaseRow align="middle" justify="end" gutter={[40, 4]}>
          <BaseCol>
            <S.CEButton />
          </BaseCol>

          <S.NavRow gutter={[12, 0]} align="middle">
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
