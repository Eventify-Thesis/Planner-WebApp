import { Radio } from 'antd';
import styled from 'styled-components';

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const InputsWrapper = styled.div`
  width: 100%;
  max-width: 25rem;
  height: 3rem;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 1280px) {
    max-width: 100%;
    margin-bottom: 1rem;
  }

  .ant-input-group-wrapper {
    display: flex;
    align-items: center;
  }

  .ant-input {
    padding: 6px 11px;
    display: flex;
    align-items: center;
  }

  .ant-input-affix-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .ant-input-prefix {
    display: flex;
    align-items: center;
    margin-right: 8px;
  }

  .ant-btn {
    height: 2.5rem;
    padding: 6px 11px;
    color: black;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  && {
    .ant-input-search-button:hover {
      opacity: 0.8;
      background-color: var(--primary-color);
      color: white;
    }
  }
`;

export const RadioGroup = styled(Radio.Group)`
  display: flex;
  align-items: center;
  height: auto;

  @media (max-width: 1280px) {
    width: 100%;
    justify-content: space-between;
  }

  .ant-radio-button-wrapper-checked {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    border-radius: 4px;
    color: white;
  }

  .ant-radio-button-wrapper-checked:before {
    display: none;
  }

  .ant-radio-button-wrapper:hover {
    color: var(--primary-color);
  }

  .ant-radio-button-wrapper-checked:hover {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    border-radius: 4px;
  }
`;

export const RadioButton = styled(Radio.Button)`
  display: flex;
  width: auto;
  min-width: 8rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;

  @media (max-width: 1280px) {
    flex: 1;
    min-width: auto;
    height: 2.2rem;
    font-size: 0.9rem;
  }
`;
