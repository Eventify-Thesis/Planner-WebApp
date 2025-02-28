import React from 'react';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import * as S from '../Header.styles';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { UserButton } from '@clerk/clerk-react';
interface DesktopHeaderProps {}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({}) => {
  const leftSide = <h1> </h1>;

  return (
    <BaseRow
      justify="space-between"
      align="middle"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {leftSide}
      <S.NavRow gutter={[20, 0]} align="middle">
        <BaseCol>
          <S.CEButton />
        </BaseCol>

        <BaseCol>
          <UserButton showName={true} appearance={{}} />
        </BaseCol>

        <BaseCol>
          <SettingsDropdown />
        </BaseCol>
      </S.NavRow>
    </BaseRow>
  );
};
