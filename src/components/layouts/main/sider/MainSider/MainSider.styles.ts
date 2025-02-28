import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { media } from '@/styles/themes/constants';
import { LAYOUT } from '@/styles/themes/constants';
import { BaseButton } from '@/components/common/BaseButton/BaseButton';
import { BaseLayout } from '@/components/common/BaseLayout/BaseLayout';

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

export const Sider = styled(BaseLayout.Sider)`
  position: fixed;
  overflow: visible;
  right: 0;
  z-index: 5;
  background: rgba(0, 0, 0, 0.7);

  min-height: 100vh;
  max-height: 100vh;

  color: var(--text-secondary-color);

  @media only screen and ${media.md} {
    right: unset;
    left: 0;
  }

  @media only screen and ${media.xl} {
    position: unset;
  }
`;

export const CollapseButton = styled(BaseButton)<{ $isCollapsed: boolean }>`
  background: var(--collapse-background-color);

  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  position: absolute;
  right: 0.5rem;

  ${(props) =>
    props.$isCollapsed &&
    css`
      right: -1rem;
    `}

  color: var(--text-secondary-color);

  &:hover {
    color: var(--text-secondary-color);
    background: var(--primary-color);
    border: 1px solid var(--border-color);
  }

  &:focus {
    color: var(--text-secondary-color);
    background: var(--primary-color);
    border: 1px solid var(--border-color);
  }
`;

export const SiderContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - ${LAYOUT.mobile.headerHeight});

  @media only screen and ${media.md} {
    max-height: calc(100vh - ${LAYOUT.desktop.headerHeight});
  }
`;

export const SiderLogoLink = styled(Link)`
  display: flex;
  align-items: center;
  overflow: hidden;
  position: relative;
`;

export const SiderLogoDiv = styled.div`
  height: ${LAYOUT.mobile.headerHeight};
  padding: ${LAYOUT.mobile.headerPadding};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media only screen and ${media.md} {
    height: ${LAYOUT.desktop.headerHeight};
    padding-top: ${LAYOUT.desktop.paddingVertical};
    padding-bottom: ${LAYOUT.desktop.paddingVertical};
  }
`;

export const BrandSpan = styled.span`
  margin: 0 1rem;
  font-weight: 700;
  width: 100%;
  line-break: normal;
  font-size: 1.3rem;
  color: var(--primary-color);
`;
