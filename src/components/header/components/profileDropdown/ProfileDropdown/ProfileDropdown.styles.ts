// @ts-nocheck
// @ts-ignore
import { DownOutlined } from '@ant-design/icons';
import { media } from '@/styles/themes/constants';
import styled from 'styled-components';
import { HeaderActionWrapper } from '../../../Header.styles';

export const ProfileDropdownHeader = styled(HeaderActionWrapper)`
  cursor: pointer;
  flex-direction: column;
  @media only screen and ${media.md} {
    border-radius: 50px;
    padding: 0.3125rem 0rem;
  }
`;

export const DownArrow = styled(DownOutlined)`
  color: var(--text-secondary-color);

  @media only screen and ${media.md} {
    color: var(--text-main-color);
  }
`;
