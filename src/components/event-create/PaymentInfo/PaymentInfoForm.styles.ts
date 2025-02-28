import styled from 'styled-components';
import { Card } from 'antd';
import { BASE_COLORS } from '@/styles/themes/constants';

export const FormSection = styled(Card)`
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: #15161b;
  color: ${BASE_COLORS.white};

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
  }

  .ant-card-head-title {
    color: ${BASE_COLORS.white};
    padding: 12px 0;
    font-size: 16px;
    font-weight: 500;
  }

  .ant-card-body {
    padding: 24px;
  }

  && {
    .ant-form-item-label > label {
      color: ${BASE_COLORS.white} !important;
    }

    .ant-input {
      background-color: #1f2128;
      border-color: #2a2c33;
      color: ${BASE_COLORS.white};

      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }

    .ant-select {
      .ant-select-selector {
        background-color: #1f2128;
        border-color: #2a2c33;
        color: ${BASE_COLORS.white};
      }

      .ant-select-arrow {
        color: ${BASE_COLORS.white};
      }
    }

    a {
      color: #1890ff;
      &:hover {
        color: #40a9ff;
      }
    }
  }
`;
