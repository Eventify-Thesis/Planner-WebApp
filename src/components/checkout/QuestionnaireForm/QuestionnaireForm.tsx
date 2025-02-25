import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormSection } from './FormSection';
import { TicketInfo } from './TicketInfo/TicketInfo';

interface QuestionnaireFormProps {}

export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({}) => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();

  const desktopLayout = (
    <BaseRow
      align="top"
      gutter={[20, 10]}
      style={{
        width: '100%',
      }}
    >
      <BaseCol xl={18} xxl={16}>
        <FormSection />
      </BaseCol>
      <BaseCol xl={6} xxl={8}>
        <TicketInfo />
      </BaseCol>
    </BaseRow>
  );

  const mobileAndTabletLayout = <div>Mobile and Tablet</div>;

  return <>{isDesktop ? desktopLayout : mobileAndTabletLayout}</>;
};
