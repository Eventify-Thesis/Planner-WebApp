import React from 'react';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import styled from 'styled-components';
import { BaseSteps } from '@/components/common/BaseSteps/BaseSteps';
import { BASE_COLORS } from '@/styles/themes/constants';

const ProgressBar: React.FC = () => {
  const { isTablet, isDesktop } = useResponsive();

  const { t } = useTranslation();

  const desktopLayout = (
    <>
      <Steps
        current={1}
        items={[
          {
            title: t('checkout.chooseTicket'),
          },
          {
            title: t('checkout.questionnaire'),
            // subTitle: 'Left 00:00:08',
          },
          {
            title: t('checkout.payment'),
          },
        ]}
      />
    </>
  );

  const mobileAndTabletLayout = <></>;

  return <>{isDesktop ? desktopLayout : mobileAndTabletLayout}</>;
};
export default ProgressBar;

const Steps = styled(BaseSteps)`
  width: 50%;
  font-family: Montserrat;

  && {
    /* Process Step */
    .ant-steps-item-process {
      .ant-steps-item-container {
        .ant-steps-item-content {
          .ant-steps-item-title {
            font-size: 14px;
            color: ${BASE_COLORS.yellow};
          }
        }
      }

      > .ant-steps-item-container
        > .ant-steps-item-content
        > .ant-steps-item-title::after {
        background-color: white;
      }
    }

    /* Finish Step */
    .ant-steps-item-finish {
      .ant-steps-item-icon {
        background: white;
      }

      > .ant-steps-item-container
        > .ant-steps-item-content
        > .ant-steps-item-title {
        color: white;
      }
    }

    /* Wait Step */
    .ant-steps-item-wait {
      .ant-steps-item-icon {
        color: white;

        > .ant-steps-icon {
          color: white;
        }
      }

      > .ant-steps-item-container
        > .ant-steps-item-content
        > .ant-steps-item-title {
        color: white;
      }
    }

    /* Common Styles */
    .ant-steps-item-icon {
      border-color: white;
    }
  }
`;
