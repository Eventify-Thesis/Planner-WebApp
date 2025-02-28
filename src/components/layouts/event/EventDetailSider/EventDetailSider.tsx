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
import { BASE_COLORS, FONT_SIZE, LAYOUT } from '@/styles/themes/constants';
import { media } from '@/styles/themes/constants';
import { SiderLogo } from '../../main/sider/SiderLogo';
import { menuItems } from './menuItems';

const { Sider } = Layout;

export const SiderDiv = styled.div`
  background: #70e1f5; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to bottom,
    #ffd194,
    #70e1f5
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to bottom,
    #ffd194,
    #70e1f5
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
`;

const StyledSider = styled(Sider)`
  background: rgba(0, 0, 0, 0.7);
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

const BackButton = styled(Button)`
  margin: 16px;
  width: calc(100% - 32px);
  background-color: var(--primary-color);
  color: ${BASE_COLORS.black};
  font-weight: 500;
  font-size: ${FONT_SIZE.xs};
`;

const MenuSection = styled.div`
  margin-bottom: 16px;

  .ant-menu-item-group-title {
    color: ${BASE_COLORS.red};
    padding: 8px 16px;
    font-size: ${FONT_SIZE.xl};
  }

  .ant-menu-item {
    color: ${BASE_COLORS.white};
    padding: 8px 16px;
    font-size: ${FONT_SIZE.md};
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

        <BackButton icon={<ArrowLeftOutlined />} onClick={handleBackClick}>
          {!isCollapsed && 'Back to Events'}
        </BackButton>

        <MenuSection>
          <Menu
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
            }}
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
