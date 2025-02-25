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
`;
