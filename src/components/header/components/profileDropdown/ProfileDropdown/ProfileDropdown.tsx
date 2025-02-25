import React, { useEffect } from 'react';
import { ProfileOverlay } from '../ProfileOverlay/ProfileOverlay';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useResponsive } from '@/hooks/useResponsive';
import * as S from './ProfileDropdown.styles';
import { BasePopover } from '@/components/common/BasePopover/BasePopover';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseAvatar } from '@/components/common/BaseAvatar/BaseAvatar';
import { readUser } from '@/services/localStorage.service';

export const ProfileDropdown: React.FC = () => {
  const { isTablet } = useResponsive();

  let user = {
    username: 'User',
  };

  return user ? (
    <BasePopover content={<ProfileOverlay />} trigger="click">
      <S.ProfileDropdownHeader as={BaseRow} align="middle">
        <BaseCol>
          <BaseAvatar
            src="https://cdn-icons-png.freepik.com/512/219/219964.png"
            alt="User"
            shape="circle"
            size={30}
          />
        </BaseCol>
        {isTablet && (
          <span
            style={{
              fontFamily: 'Montserrat',
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >{`${user.username}`}</span>
        )}
      </S.ProfileDropdownHeader>
    </BasePopover>
  ) : null;
};
