// src/components/event-create/ShowAndTicket/ShowAndTicketForm.styles.ts
import styled from 'styled-components';
import { Card, Button, Collapse } from 'antd';

export const StyledCollapse = styled(Collapse)`
  && {
    .ant-collapse {
      box-shadow: none !important;
      border: none !important;
    }
  }

  && {
    .ant-collapse-item-active {
      .ant-collapse-header {
        background: #15161b !important;
      }
    }
  }
  .ant-collapse-item {
    overflow: hidden;

    .ant-collapse-header {
      background: #15161b;
      padding: 12px 16px;
      align-items: center;
      background: white !important;
      border-radius: 0px !important;
      border-top-left-radius: 8px !important;
      border-top-right-radius: 8px !important;

      .ant-collapse-arrow {
        margin-right: 8px;
        color: white;
      }

      .ant-space {
        color: white;
      }

      button {
        color: white;
      }
    }

    .ant-collapse-content {
      background: var(--background-color);

      .ant-collapse-content-box {
        color: white;
      }

      .ant-form-item-label > label {
        color: white;
      }
    }
  }
`;

export const StyledTicketContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 16px;
`;

export const StyledCard = styled(Card)`
  margin-bottom: 16px;
  .ant-card-head {
    background: var(--primary-color);
  }
`;

export const TicketCard = styled(Card)`
  width: 100%;
  .ant-card-head {
    min-height: 36px;
    padding: 0 12px;
    font-size: 14px;
  }
`;

export const ShowHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const TimePickerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .ant-form-item {
    width: 100%;

    .ant-picker {
      width: 50%;
    }
  }

  gap: 16px;
  margin-bottom: 24px;
`;

export const TicketContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
`;
