import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  BarChartOutlined,
  OrderedListOutlined,
  UserOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  GiftOutlined,
  ArrowLeftOutlined,
  ScanOutlined,
  BorderOutlined,
} from '@ant-design/icons';
import { styled } from 'styled-components';
import { LAYOUT } from '@/styles/themes/constants';
import { media } from '@/styles/themes/constants';
import { SiderLogo } from '../../main/sider/SiderLogo';

const { Sider } = Layout;

const StyledSider = styled(Sider)`
  background: #fff;
  border-right: 1px solid #f0f0f0;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 2;

  @media only screen and ${media.md} {
    position: fixed;
  }

  @media only screen and ${media.xl} {
    position: relative;
  }
`;

const LogoWrapper = styled.div`
  height: ${LAYOUT.desktop.headerHeight};
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;

  img {
    height: 32px;
    width: auto;
  }

  .logo-text {
    color: var(--primary-color);
    font-size: 1.25rem;
    font-weight: 700;
    margin-left: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const BackButton = styled(Button)`
  margin: 16px;
  width: calc(100% - 32px);
`;

const MenuSection = styled.div`
  margin-bottom: 16px;

  .ant-menu-item-group-title {
    color: #8c8c8c;
    padding: 8px 16px;
    font-size: 12px;
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
    <StyledSider
      trigger={null}
      collapsible
      collapsed={isCollapsed}
      width={260}
      collapsedWidth={80}
    >
      <SiderLogo isSiderCollapsed={isCollapsed} toggleSider={setCollapsed} />

      <BackButton icon={<ArrowLeftOutlined />} onClick={handleBackClick}>
        {!isCollapsed && 'Back to Events'}
      </BackButton>

      <MenuSection>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          onClick={handleMenuClick}
          items={[
            {
              key: 'report',
              type: 'group',
              label: 'Report',
              children: [
                {
                  key: 'analytics',
                  icon: <BarChartOutlined />,
                  label: 'Analytics',
                },
                {
                  key: 'orders',
                  icon: <OrderedListOutlined />,
                  label: 'Order',
                },
                {
                  key: 'checkin',
                  icon: <ScanOutlined />,
                  label: 'Check-in',
                },
              ],
            },
            {
              key: 'settings',
              type: 'group',
              label: 'Event Settings',
              children: [
                {
                  key: 'members',
                  icon: <UserOutlined />,
                  label: 'Member',
                },
                {
                  key: 'settings',
                  icon: <SettingOutlined />,
                  label: 'Setting',
                },
                {
                  key: 'seatmap',
                  icon: <BorderOutlined />,
                  label: 'Seat Map',
                },
                {
                  key: 'questions',
                  icon: <QuestionCircleOutlined />,
                  label: 'Question',
                },
              ],
            },
            {
              key: 'marketing',
              type: 'group',
              label: 'Marketing',
              children: [
                {
                  key: 'vouchers',
                  icon: <GiftOutlined />,
                  label: 'Voucher',
                },
              ],
            },
          ]}
        />
      </MenuSection>
    </StyledSider>
  );
};
