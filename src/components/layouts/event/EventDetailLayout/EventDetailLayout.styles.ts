import styled from 'styled-components';
import { LAYOUT, media } from '@/styles/themes/constants';
import { BaseLayout } from '@/components/common/BaseLayout/BaseLayout';

export const LayoutMaster = styled(BaseLayout)`
  height: 100vh;
`;

export const LayoutMain = styled(BaseLayout)`
  @media only screen and ${media.md} {
    margin-left: 80px;
  }

  @media only screen and ${media.xl} {
    margin-left: unset;
  }

    background: var(--tk-color-gray) !important;

  // background: #70e1f5;
  // background: -webkit-linear-gradient(to bottom, #ffd194, #70e1f5);
  // background: linear-gradient(to bottom, #ffd194, #70e1f5);
`;

export const MainContent = styled.main`
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
