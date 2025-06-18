import React from 'react';
import { SettingsDropdown } from '../components/settingsDropdown/SettingsDropdown';
import * as S from '../Header.styles';
import { UserButton } from '@clerk/clerk-react';
import './MobibleHeader.css';

interface MobileHeaderProps {
  toggleSider: () => void;
  isSiderOpened: boolean;
  eventName?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  toggleSider,
  isSiderOpened,
  eventName,
}) => {
  return (
    <S.MobileHeaderContainer>
      {/* Left side - Burger Menu & Event Name */}
      <S.MobileHeaderLeft>
        <S.MobileBurgerWrapper>
          <S.MobileBurger onClick={toggleSider} isCross={isSiderOpened} />
        </S.MobileBurgerWrapper>

        {/* Event name for mobile */}
        {eventName && <S.MobileEventTitle>{eventName}</S.MobileEventTitle>}
      </S.MobileHeaderLeft>

      {/* Right side - User actions */}
      <S.MobileHeaderRight>
        <S.MobileUserSection>
          {/* Compact User Button for mobile */}
          <S.MobileActionButton>
            <UserButton
              showName={false}
              appearance={{
                elements: {
                  userButtonBox: {
                    width: '32px',
                    height: '32px',
                  },
                  userButtonTrigger: {
                    width: '32px',
                    height: '32px',
                    padding: '2px',
                    border: 'none',
                    borderRadius: '8px',
                  },
                  avatarBox: {
                    width: '28px',
                    height: '28px',
                  },
                },
              }}
            />
          </S.MobileActionButton>

          {/* Settings Dropdown */}
          <S.MobileActionButton>
            <SettingsDropdown />
          </S.MobileActionButton>
        </S.MobileUserSection>
      </S.MobileHeaderRight>
    </S.MobileHeaderContainer>
  );
};
