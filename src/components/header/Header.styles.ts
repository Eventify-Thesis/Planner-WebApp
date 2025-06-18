import styled, { css } from 'styled-components';
import { BurgerIcon } from '@/components/common/Burger/BurgerIcon';
import { CreateEventButton } from '@/components/header/components/CreateEventButton/CreateEventButton';
import { FONT_SIZE, LAYOUT, media } from '@/styles/themes/constants';
import { BaseCollapse } from '../common/BaseCollapse/BaseCollapse';
import { BaseCol } from '../common/BaseCol/BaseCol';
import { BaseRow } from '../common/BaseRow/BaseRow';
import { Icon } from '@iconify/react/dist/iconify.js';

export const HeaderActionWrapper = styled.div`
  cursor: pointer;
  color: white;
  & > .ant-btn > span[role='img'],
  .ant-badge {
    font-size: 1.25rem;

    @media only screen and ${media.md} {
      font-size: 1.625rem;
    }
  }

  & .ant-badge {
    display: inline-block;
  }
`;

export const DropdownCollapse = styled(BaseCollapse)`
  & > .ant-collapse-item > .ant-collapse-header {
    font-weight: 600;
    font-size: 0.875rem;

    color: var(--primary-color);

    @media only screen and ${media.md} {
      font-size: 1rem;
    }
  }

  & > .ant-collapse-item-disabled > .ant-collapse-header {
    cursor: default;

    & > span[role='img'] {
      display: none;
    }
  }
`;

export const BurgerCol = styled(BaseCol)`
  z-index: 999;
  display: flex;
`;

export const MobileBurger = styled(BurgerIcon)`
  width: 1.75rem;
  height: 1.75rem;
  margin-right: -0.5rem;
  color: var(--text-main-color);

  ${(props) =>
    props.isCross &&
    css`
      color: var(--text-secondary-color);
    `};
`;

export const SearchColumn = styled(BaseCol)`
  padding: ${LAYOUT.desktop.paddingVertical} ${LAYOUT.desktop.paddingHorizontal};
`;

interface ProfileColumn {
  // $isTwoColumnsLayout: boolean;
}

export const ProfileColumn = styled(BaseCol)<ProfileColumn>`
  @media only screen and ${media.md} {
    ${(props) =>
      css`
        padding: 0 ${LAYOUT.desktop.paddingHorizontal};
      `}
  }
`;

export const NavRow = styled(BaseRow)``;
export const NavItem = styled(BaseCol)`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  font-family: Montserrat, sans-serif;
  font-size: ${FONT_SIZE.md};
  font-weight: 600;
`;

export const NavIcon = styled(Icon)`
  color: white;
  width: 24px;
  height: 24px;
  margin-bottom: 5px;
`;

export const CEButton = styled(CreateEventButton)`
  display: none;

  @media only screen and ${media.lg} {
    display: flex;
  }
`;

// Enhanced Mobile Header Styles
export const MobileHeaderContainer = styled.div`
  padding: 12px 0;
  background: linear-gradient(135deg, #313132 0%, #2a2a2b 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  position: relative;
  margin: 0;
  width: 100%;
  box-sizing: border-box;

  @media only screen and ${media.xs} {
    padding: 8px 0;
    height: 56px;
  }
`;

export const MobileHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0; /* Allow text truncation */
  padding-left: 16px;

  @media only screen and ${media.xs} {
    gap: 8px;
    padding-left: 12px;
  }
`;

export const MobileHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-right: 16px;

  @media only screen and ${media.xs} {
    gap: 6px;
    padding-right: 12px;
  }
`;

export const MobileEventTitle = styled.h2`
  color: white;
  font-weight: 600;
  margin: 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  @media only screen and ${media.xs} {
    font-size: 14px;
    max-width: 120px;
  }
`;

export const MobileBurgerWrapper = styled.div`
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const MobileUserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media only screen and ${media.xs} {
    gap: 6px;
  }
`;

export const MobileActionButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
