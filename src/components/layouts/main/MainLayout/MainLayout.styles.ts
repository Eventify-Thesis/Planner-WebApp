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

  background: black !important;
`;

// background: #e9d362;  /* fallback for old browsers */
// background: -webkit-linear-gradient(to right, #333333, #e9d362);  /* Chrome 10-25, Safari 5.1-6 */
// background: linear-gradient(to right, #333333, #e9d362); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
