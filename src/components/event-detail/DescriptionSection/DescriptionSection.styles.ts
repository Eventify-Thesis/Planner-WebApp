import { Collapse } from 'antd';
import styled, { css } from 'styled-components';

export const DescriptionCollapse = styled(Collapse)`
  border: none;

  & > .ant-collapse-item:last-child > .ant-collapse-header {
    background: white;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
  }

  >.ant-collapse-item: last-child>.ant-collapse-header {
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;
  }
`;
