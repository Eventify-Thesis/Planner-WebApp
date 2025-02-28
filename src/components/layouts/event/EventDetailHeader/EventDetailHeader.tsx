import React from 'react';
import { Layout, Typography } from 'antd';
import { styled } from 'styled-components';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { UserButton } from '@clerk/clerk-react';
import { SettingsDropdown } from '@/components/header/components/settingsDropdown/SettingsDropdown';
import { LAYOUT } from '@/styles/themes/constants';
import { media } from '@/styles/themes/constants';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useResponsive } from '@/hooks/useResponsive';
import { Icon } from '@iconify/react/dist/iconify.js';

const { Header } = Layout;
const { Title } = Typography;

const StyledHeader = styled(Header)`
  background: rgba(0, 0, 0, 0.8);
  padding: 0 24px;
  height: ${LAYOUT.desktop.headerHeight};
  line-height: 1.5;
  position: sticky;
  top: 0;
  z-index: 1;
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media only screen and ${media.md} {
    padding: ${LAYOUT.desktop.paddingVertical}
      ${LAYOUT.desktop.paddingHorizontal};
    height: ${LAYOUT.desktop.headerHeight};
  }

  .ant-row {
    height: 100%;
  }
`;

const StyledTitle = styled(Title)`
  margin: 0 !important;
  color: #fff !important;
  font-size: 1.25rem !important;
  line-height: ${LAYOUT.desktop.headerHeight} !important;
`;

const NavRow = styled(BaseRow)`
  display: flex;
  align-items: center;
  gap: 20px;

  .ant-btn {
    color: var(--text-secondary-color);
  }
`;

const CollapseButton = styled.div`
  font-size: 1.25rem;
  color: #fff;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  margin-right: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const CreateEventButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: var(--primary-light-color);
  }

  .icon {
    font-size: 1.25rem;
  }
`;

interface EventDetailHeaderProps {
  eventName: string;
  toggleSider: () => void;
  isSiderOpened: boolean;
}

export const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({
  eventName,
  toggleSider,
  isSiderOpened,
}) => {
  const { isTablet } = useResponsive();

  return (
    <StyledHeader>
      <BaseRow justify="space-between" align="middle">
        <BaseCol style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isTablet && (
            <CollapseButton onClick={toggleSider}>
              {isSiderOpened ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </CollapseButton>
          )}
          <StyledTitle level={4}>{eventName}</StyledTitle>
        </BaseCol>

        <NavRow>
          <CreateEventButton>
            <Icon icon="ic:baseline-add" className="icon" />
            Create Event
          </CreateEventButton>
          <UserButton showName={true} />
          <SettingsDropdown />
        </NavRow>
      </BaseRow>
    </StyledHeader>
  );
};
