import styled from 'styled-components';
import { media } from '@/styles/themes/constants';
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

  background: #70e1f5;
  background: -webkit-linear-gradient(to bottom, #ffd194, #70e1f5);
  background: linear-gradient(to bottom, #ffd194, #70e1f5);
`;

export const MainContent = styled.main`
  padding: 24px;
  min-height: calc(100vh - 64px); // Subtract header height
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  
  @media only screen and ${media.md} {
    padding: 32px;
  }

  @media only screen and ${media.xl} {
    padding: 40px;
  }
`;
