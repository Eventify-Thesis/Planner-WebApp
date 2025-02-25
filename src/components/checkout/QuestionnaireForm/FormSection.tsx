import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseTypography } from '@/components/common/BaseTypography/BaseTypography';
import { useResponsive } from '@/hooks/useResponsive';
import { BASE_COLORS } from '@/styles/themes/constants';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface FormSectionProps {}

export const FormSection: React.FC<FormSectionProps> = ({}) => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();

  const desktopLayout = (
    <FormWrapper align="top">
      <Header>{t('checkout.questionnaireForm')}</Header>
    </FormWrapper>
  );

  const mobileAndTabletLayout = <div>Mobile and Tablet</div>;

  return <>{isDesktop ? desktopLayout : mobileAndTabletLayout}</>;
};

const FormWrapper = styled(BaseRow)`
  border-radius: 8px;
  background-color: rgb(39, 39, 42);

  height: 40rem;
`;

const Header = styled(BaseTypography)`
  font-family: Montserrat;
  padding-block: 1rem;
  padding-inline: 1.25rem;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: grey;
  width: 100%;
  color: ${BASE_COLORS['yellow']};
`;
