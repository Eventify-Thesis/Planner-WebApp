import styled from 'styled-components';
import { Card } from 'antd';
import { BASE_COLORS } from '@/styles/themes/constants';

export const FormSection = styled(Card)`
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: #15161b;
  color: ${BASE_COLORS.white};

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 0 24px;
    min-height: 48px;
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

    .ant-input-group-addon {
      color: ${BASE_COLORS.white};
    }

    .ant-radio-wrapper {
      color: ${BASE_COLORS.white};

      .ant-radio-inner {
        border-color: ${BASE_COLORS.white};
      }

      .ant-radio-checked .ant-radio-inner {
        border-color: ${BASE_COLORS.white};
      }

      .ant-radio-inner::after {
        background-color: ${BASE_COLORS.white};
      }
    }

    .ant-radio-wrapper:hover .ant-radio-inner {
      border-color: ${BASE_COLORS.white};
    }
  }
`;
