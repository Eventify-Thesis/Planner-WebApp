import styled, { css } from 'styled-components';
import { BurgerIcon } from '@/components/common/Burger/BurgerIcon';
import { CreateEventButton } from '@/components/header/components/CreateEventButton/CreateEventButton';
import { LAYOUT, media } from '@/styles/themes/constants';
import { BaseCollapse } from '../common/BaseCollapse/BaseCollapse';
import { BaseCol } from '../common/BaseCol/BaseCol';
import { BaseButton } from '../common/BaseButton/BaseButton';

export const UnauthHeaderActionWrapper = styled.div`
  cursor: pointer;

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

interface ProfileColumn {}

export const ProfileColumn = styled(BaseCol)<ProfileColumn>`
  @media only screen and ${media.md} {
    ${(props) =>
      css`
        padding: 0 ${LAYOUT.desktop.paddingHorizontal};
      `}
  }
  height: 100%;
  display: flex;
  justify-content: flex-end;
  background-color: ;
`;

export const LinkButton = styled(BaseButton)`
  & > span,
  & > a {
    text-decoration: none;
  }
  color: white;
  font-family: 'Montserrat';
`;

export const CEButton = styled(CreateEventButton)`
  display: none;

  @media only screen and ${media.lg} {
    display: flex;
  }
`;
