import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Text, ActionIcon, Group } from '@mantine/core';
import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import { useResponsive } from '@/hooks/useResponsive';
import logo from '@/assets/logo.png';
import { useAppSelector } from '@/hooks/reduxHooks';
import { styled } from 'styled-components';
import { LAYOUT } from '@/styles/themes/constants';

interface SiderLogoProps {
  isSiderCollapsed: boolean;
  toggleSider: () => void;
}
// Styled components to maintain compatibility with existing styles
const SiderLogoDiv = styled.div`
  background: rgba(0, 0, 0, 0.7);
  height: ${LAYOUT.mobile.headerHeight};
  padding: ${LAYOUT.mobile.headerPadding};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;

  @media only screen and (min-width: 768px) {
    height: ${LAYOUT.desktop.headerHeight};
    padding-top: ${LAYOUT.desktop.paddingVertical};
    padding-bottom: ${LAYOUT.desktop.paddingVertical};
  }
`;

const BrandSpan = styled(Text)`
  margin: 0 1rem;
  font-weight: 700;
  font-size: 1.3rem;
  background: rgba(0, 0, 0, 0.7);
  color: var(--primary-color);
`;

const SiderLogoLink = styled(Link)`
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
  text-decoration: none;
`;

const CollapseActionButton = styled(ActionIcon)<{ $isCollapsed: boolean }>`
  position: absolute;
  right: ${(props) => (props.$isCollapsed ? '-12px' : '8px')};
  background-color: var(--collapse-background-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary-color);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--primary-color);
  }
`;

export const SiderLogo: React.FC<SiderLogoProps> = ({
  isSiderCollapsed,
  toggleSider,
}) => {
  const { tabletOnly } = useResponsive();
  const theme = useAppSelector((state) => state.theme.theme);
  const img = theme === 'light' ? logo : logo;

  return (
    <SiderLogoDiv>
      <SiderLogoLink to="/">
        <img src={img} alt="Planner Center" width={48} height={48} />
        {!isSiderCollapsed && <BrandSpan>Planner Center</BrandSpan>}
      </SiderLogoLink>
      {tabletOnly && (
        <CollapseActionButton
          $isCollapsed={isSiderCollapsed}
          onClick={toggleSider}
          radius="xl"
          size="sm"
        >
          {isSiderCollapsed ? (
            <IconChevronRight size={16} />
          ) : (
            <IconChevronLeft size={16} />
          )}
        </CollapseActionButton>
      )}
    </SiderLogoDiv>
  );
};
