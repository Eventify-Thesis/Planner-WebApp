import { BaseButton } from '@/components/common/BaseButton/BaseButton';
import { BASE_COLORS } from '@/styles/themes/constants';
import { Collapse } from 'antd';
import styled, { css } from 'styled-components';

export const TicketInfoWrapper = styled.div`
  background-color: rgb(39, 39, 42);
  border-radius: 8px;
  color: rgb(255, 255, 255);
`;

export const TicketInfoHeader = styled.h2`
  width: 100%;
  font-size: 16px;
  padding: 0.75rem;
  font-weight: 600;
  border-bottom: 1px solid rgb(0, 0, 0);
`;

export const TicketsList = styled(Collapse)`
  border: none;
  & > .ant-collapse-item > .ant-collapse-header {
    border: none;
    position: relative;
    background-color: rgb(39, 39, 42);
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    padding: 12px 16px;
    line-height: 1.5714285714285714;
    cursor: pointer;
    transition: all 0.3s, visibility 0s;
    color: white;
  }
`;

/**
 * Button component for buying tickets.
 */
export const BuyTicketButton = styled(BaseButton)`
  width: 10.938rem;
  background-color: ${BASE_COLORS['yellow']};
  color: white;
  text-align: center;
  font-weight: 700;
  padding: 7px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;
