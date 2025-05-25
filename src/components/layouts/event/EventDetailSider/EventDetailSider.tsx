import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { styled } from 'styled-components';
import { BASE_COLORS, FONT_SIZE, LAYOUT } from '@/styles/themes/constants';
import { media } from '@/styles/themes/constants';
import { SiderLogo } from '../../main/sider/SiderLogo';
import { menuItems } from './menuItems';

const { Sider } = Layout;

export const SiderDiv = styled.div``;

const StyledSider = styled(Sider)`
  background: black;
  border-right: 1px solid #f0f0f0;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;

  @media only screen and ${media.md} {
    position: fixed;
  }

  @media only screen and ${media.xl} {
    position: relative;
  }
`;

const BackButton = styled.div`
  margin: 16px;
  background: rgba(0, 0, 0, 0.7);
  width: calc(100% - 32px);
`;

const MenuSection = styled.div`
  margin-bottom: 16px;

  .ant-menu {
    background: rgba(0, 0, 0, 0.7);
  }

  .ant-menu-item-group-title {
    color: var(--primary-color);
    padding: 8px 16px;
    font-size: ${FONT_SIZE.xl};
  }

  .ant-menu-item {
    color: ${BASE_COLORS.white};
    padding: 8px 16px;
    font-size: ${FONT_SIZE.md};
  }

  .ant-menu-item:hover {
    color: var(--primary-color) !important;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .ant-menu-item-selected {
    background-color: rgba(255, 255, 255, 0.2) !important;
    color: var(--primary-color) !important;
  }
`;

interface EventDetailSiderProps {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const EventDetailSider: React.FC<EventDetailSiderProps> = ({
  isCollapsed,
  setCollapsed,
}) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const location = useLocation();

  const handleBackClick = () => {
    navigate('/events');
  };

  const getSelectedKeys = () => {
    const path = location.pathname.split('/').pop();
    return path ? [path] : [];
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(`/events/${eventId}/${key}`);
  };

  return (
    <SiderDiv>
      <StyledSider
        trigger={null}
        collapsible
        collapsed={isCollapsed}
        width={260}
        collapsedWidth={80}
      >
        <SiderLogo isSiderCollapsed={isCollapsed} toggleSider={setCollapsed} />

        <BackButton>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBackClick}
            variant="filled"
            fullWidth
            styles={{
              root: {
                backgroundColor: 'var(--primary-color)',
                color: BASE_COLORS.black,
                fontWeight: 500,
                fontSize: FONT_SIZE.xs,
              },
            }}
          >
            {!isCollapsed && 'Back to Events'}
          </Button>
        </BackButton>

        <MenuSection>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            onClick={handleMenuClick}
            items={menuItems}
          />
        </MenuSection>
      </StyledSider>
    </SiderDiv>
  );
};
