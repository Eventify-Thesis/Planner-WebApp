import styled from 'styled-components';
import { LAYOUT, media } from '@/styles/themes/constants';
import { BaseLayout } from '@/components/common/BaseLayout/BaseLayout';

export const LayoutMaster = styled(BaseLayout)`
  height: 100%;
`;

export const LayoutMain = styled(BaseLayout)`
  @media only screen and ${media.md} {
    margin-left: 80px;
  }

  @media only screen and ${media.xl} {
    margin-left: unset;
  }

  background: var(--tk-color-gray) !important;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.main`
  // height: calc(100vh - ${LAYOUT.desktop.headerHeight});
  // max-height: calc(100vh - ${LAYOUT.desktop.headerHeight});
  overflow-y: auto;
  padding-bottom: 60px;
`;
