import { Card } from 'antd';
import styled, { css } from 'styled-components';

// Styled components with enhanced styling
export const disabledSelect = css`
  .ant-select-disabled {
    .ant-select-selector {
      background-color: #3a3c42 !important;
      color: #a0a0a0 !important;
      border-color: #4a4c54 !important;
    }

    .ant-select-selection-placeholder {
      color: #a0a0a0 !important;
    }

    .ant-select-arrow {
      color: #a0a0a0 !important;
    }
  }
`;
export const FormSection = styled(Card)`
  ${disabledSelect}

  margin-bottom: 24px;
  border-radius: 12px;
  background-color: #23252c;
  border: 1px solid #e0e7ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  color: white;

  .ant-card-head {
    border-bottom: 2px solid #e0e7ff;
    .ant-card-head-title {
      font-weight: 600;
      color: white;
    }
  }

  .ant-upload {
    color: white;
    width: 100% !important;
    height: 100% !important;
  }

  .ant-upload-list-item-container {
    width: 100% !important;
    height: 400px !important;

    && {
      img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center !important;
      }
    }
  }

  .ant-form-item-required {
    color: white !important;
  }

  && {
    .ant-radio-label {
      color: white;
    }
  }
`;

export const ImageUploadWrapper = styled.div`
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 24px;
  margin-bottom: 24px;
  width: 100%;

  .ant-upload.ant-upload-select-picture-card {
    width: 100%;
    aspect-ratio: unset;
  }

  .ant-upload-list-picture-card-container {
    width: 100%;
    aspect-ratio: unset;
  }

  .ant-upload-list-item-thumbnail img {
    object-fit: cover;
    height: 100%;
  }
`;
export const LocationGrid = styled.div`
  display: grid;
  color: white;
  grid-template-columns: 50% 50%;
  gap: 16px;
`;
