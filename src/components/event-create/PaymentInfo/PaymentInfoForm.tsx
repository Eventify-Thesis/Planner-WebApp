import React, { useEffect } from 'react';
import { Form, Input, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import * as S from './PaymentInfoForm.styles';
import { FormStepProps } from '../types';
import { BASE_COLORS } from '@/styles/themes/constants';
import { useParams } from 'react-router-dom';
import { notificationController } from '@/controllers/notificationController';
import { getEventPayment } from '@/services/event.service';
import { BusinessType } from '@/constants/enums/event';

const { Text } = Typography;

interface PaymentInfoFormProps extends FormStepProps {}

export const PaymentInfoForm: React.FC<PaymentInfoFormProps> = ({
  formRef,
}) => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId?: string }>();

  useEffect(() => {
    const loadPaymentData = async () => {
      if (eventId) {
        try {
          const result = await getEventPayment(eventId);
          if (!result) return;

          if (formRef.current) {
            formRef.current.setFieldsValue({
              ...result,
            });
          }
        } catch (error) {
          notificationController.error({
            message: error.message || t('event_create.failed_to_load'),
          });
        }
      }
    };

    loadPaymentData();
  }, [eventId, formRef, t]);

  return (
    <Form
      layout="vertical"
      ref={formRef}
      style={{ width: '100%', padding: '0 24px 24px 24px' }}
    >
      {/* Payment Information Notice */}
      <S.FormSection>
        <Text
          style={{
            color: BASE_COLORS.white,
            display: 'block',
            marginBottom: '16px',
          }}
        >
          {t('payment_info.notice')}
        </Text>
        <Text style={{ color: BASE_COLORS.white }}>
          {t('payment_info.contact_info')}{' '}
          <a href={`tel:${t('payment_info.phone')}`}>
            {t('payment_info.phone')}
          </a>{' '}
          or{' '}
          <a href={`mailto:${t('payment_info.email')}`}>
            {t('payment_info.email')}
          </a>
        </Text>
      </S.FormSection>

      {/* Account Information */}
      <S.FormSection title={t('payment_info.account_information')}>
        <Form.Item
          label={t('payment_info.bank_account')}
          name="bankAccount"
          rules={[
            {
              required: true,
              message: t('payment_info.bank_account_required'),
            },
            {
              max: 100,
              message: t('payment_info.bank_account_max_length'),
            },
          ]}
        >
          <Input placeholder={t('payment_info.bank_account_placeholder')} />
        </Form.Item>

        <Form.Item
          label={t('payment_info.bank_account_name')}
          name="bankAccountName"
          rules={[
            {
              required: true,
              message: t('payment_info.bank_account_name_required'),
            },
            {
              max: 100,
              message: t('payment_info.bank_account_name_max_length'),
            },
          ]}
        >
          <Input
            placeholder={t('payment_info.bank_account_name_placeholder')}
          />
        </Form.Item>

        <Form.Item
          label={t('payment_info.bank_account_number')}
          name="bankAccountNumber"
          rules={[
            {
              required: true,
              message: t('payment_info.bank_account_number_required'),
            },
            {
              pattern: /^\d+$/,
              message: t('payment_info.bank_account_number_invalid'),
            },
          ]}
        >
          <Input
            placeholder={t('payment_info.bank_account_number_placeholder')}
            type="number"
          />
        </Form.Item>

        <Form.Item
          label={t('payment_info.bank_office')}
          name="bankOffice"
          rules={[
            {
              required: true,
              message: t('payment_info.bank_office_required'),
            },
            {
              max: 100,
              message: t('payment_info.bank_office_max_length'),
            },
          ]}
        >
          <Input placeholder={t('payment_info.bank_office_placeholder')} />
        </Form.Item>
      </S.FormSection>

      {/* Business Information */}
      <S.FormSection title={t('payment_info.business_information')}>
        <Form.Item
          label={t('payment_info.business_type')}
          name="businessType"
          rules={[
            {
              required: true,
              message: t('payment_info.business_type_required'),
            },
          ]}
        >
          <Select placeholder={t('payment_info.business_type_placeholder')}>
            <Select.Option value={BusinessType.INDIVIDUAL}>
              {t('payment_info.business_type_individual')}
            </Select.Option>
            <Select.Option value={BusinessType.COMPANY}>
              {t('payment_info.business_type_company')}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t('payment_info.company_name')}
          name="companyName"
          rules={[
            {
              max: 100,
              message: t('payment_info.company_name_max_length'),
            },
          ]}
        >
          <Input placeholder={t('payment_info.company_name_placeholder')} />
        </Form.Item>

        <Form.Item
          label={t('payment_info.company_address')}
          name="companyAddress"
          rules={[
            {
              max: 200,
              message: t('payment_info.company_address_max_length'),
            },
          ]}
        >
          <Input placeholder={t('payment_info.company_address_placeholder')} />
        </Form.Item>

        <Form.Item
          label={t('payment_info.tax_number')}
          name="taxNumber"
          rules={[
            {
              pattern: /^\d+$/,
              message: t('payment_info.tax_number_invalid'),
            },
          ]}
        >
          <Input placeholder={t('payment_info.tax_number_placeholder')} />
        </Form.Item>
      </S.FormSection>
    </Form>
  );
};
