import { BaseButton } from '@/components/common/BaseButton/BaseButton';
import { BASE_COLORS } from '@/styles/themes/constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface ContinueButtonProps {}

export const ContinueButton: React.FC<ContinueButtonProps> = () => {
  const { t } = useTranslation();
  return (
    <CButton>
      {t('checkout.continue')}
      <svg
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.207 5.293a1 1 0 00-1.414 1.414L12.086 12l-5.293 5.293a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414l-6-6z"
          fill="#fff"
        ></path>
        <path
          d="M13.207 5.293a1 1 0 10-1.414 1.414L17.086 12l-5.293 5.293a1 1 0 001.414 1.414l6-6a1 1 0 000-1.414l-6-6z"
          fill="#fff"
        ></path>
      </svg>
    </CButton>
  );
};

const CButton = styled(BaseButton)`
  background-color: ${BASE_COLORS['yellow']};
  color: ${BASE_COLORS['white']};
  padding: 10px 35px;
  margin-top: 20px;
  padding-block: 0.6rem;
  border-radius: 0.25rem;
  font-size: 1em;
  font-weight: bold;
  transition: background-color 0.4sease-in-out;
`;
