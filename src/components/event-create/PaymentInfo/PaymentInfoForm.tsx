import React, { useEffect } from 'react';
import {
  TextInput,
  NumberInput,
  Select,
  Text,
  Box,
  Paper,
  Stack,
  Flex,
  Anchor,
  Loader
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { 
  IconBuildingBank, 
  IconBuildingStore
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { BusinessType } from '@/constants/enums/event';
import { useGetEventPayment } from '@/queries/useGetEventPayment';
import { safeSetFormValues } from '@/utils/formUtils';

// Styles
const styles = {
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    fontWeight: 600,
    fontSize: '18px',
  },
  sectionIcon: {
    color: 'white',
    backgroundColor: '#228be6',
    width: 30,
    height: 30,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    color: '#868e96',
  },
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => {
  return (
    <Flex align="center" style={styles.sectionTitle}>
      <Box style={styles.sectionIcon}>{icon}</Box>
      <Text>{title}</Text>
    </Flex>
  );
};

// Modify the interface to properly handle the form ref type
interface PaymentInfoFormProps {
  formRef?: React.MutableRefObject<any>;
}

export const PaymentInfoForm: React.FC<PaymentInfoFormProps> = ({
  formRef,
}) => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId?: string }>();
  const { data: paymentData, isLoading } = useGetEventPayment(eventId);

  const form = useForm({
    initialValues: {
      bankAccount: '',
      bankAccountName: '',
      bankAccountNumber: '',
      bankOffice: '',
      businessType: '',
      name: '',
      address: '',
      taxNumber: '',
    },
    validate: {
      bankAccount: (value) => 
        !value ? t('payment_info.bank_account_required') : 
        value.length > 100 ? t('payment_info.bank_account_max_length') : null,
      bankAccountName: (value) => 
        !value ? t('payment_info.bank_account_name_required') : 
        value.length > 100 ? t('payment_info.bank_account_name_max_length') : null,
      bankAccountNumber: (value) => 
        !value ? t('payment_info.bank_account_number_required') : 
        !/^\d+$/.test(value) ? t('payment_info.bank_account_number_invalid') : null,
      bankOffice: (value) => 
        !value ? t('payment_info.bank_office_required') : 
        value.length > 100 ? t('payment_info.bank_office_max_length') : null,
      businessType: (value) => 
        !value ? t('payment_info.business_type_required') : null,
      name: (value) => 
        value && value.length > 100 ? t('payment_info.company_name_max_length') : null,
      address: (value) => 
        value && value.length > 200 ? t('payment_info.company_address_max_length') : null,
      taxNumber: (value) => 
        value && !/^\d+$/.test(value) ? t('payment_info.tax_number_invalid') : null,
    },
  });

  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [formRef, form]);

  useEffect(() => {
    if (paymentData && formRef && formRef.current) {
      safeSetFormValues(formRef, {
        ...paymentData,
      });
    }
  }, [paymentData, formRef]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h={200}>
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <Box w="100%" p="24px">
      {/* Payment Information Notice */}
      <Paper p="lg" mb="md" bg="blue.9" c="white">
        <Text mb="sm">
          {t('payment_info.notice')}
        </Text>
        <Text>
          {t('payment_info.contact_info')}{' '}
          <Anchor href={`tel:${t('payment_info.phone')}`} c="white" underline="always">
            {t('payment_info.phone')}
          </Anchor>{' '}
          or{' '}
          <Anchor href={`mailto:${t('payment_info.email')}`} c="white" underline="always">
            {t('payment_info.email')}
          </Anchor>
        </Text>
      </Paper>

      {/* Account Information */}
      <Paper style={styles.section}>
        <SectionTitle
          icon={<IconBuildingBank size={18} />}
          title={t('payment_info.account_information')}
        />

        <Stack gap="md">
          <TextInput
            required
            label={t('payment_info.bank_account')}
            placeholder={t('payment_info.bank_account_placeholder')}
            {...form.getInputProps('bankAccount')}
            withAsterisk
          />

          <TextInput
            required
            label={t('payment_info.bank_account_name')}
            placeholder={t('payment_info.bank_account_name_placeholder')}
            {...form.getInputProps('bankAccountName')}
            withAsterisk
          />

          <TextInput
            required
            label={t('payment_info.bank_account_number')}
            placeholder={t('payment_info.bank_account_number_placeholder')}
            {...form.getInputProps('bankAccountNumber')}
            withAsterisk
          />

          <TextInput
            required
            label={t('payment_info.bank_office')}
            placeholder={t('payment_info.bank_office_placeholder')}
            {...form.getInputProps('bankOffice')}
            withAsterisk
          />
        </Stack>
      </Paper>

      {/* Business Information */}
      <Paper style={styles.section}>
        <SectionTitle
          icon={<IconBuildingStore size={18} />}
          title={t('payment_info.business_information')}
        />

        <Stack gap="md">
          <Select
            required
            label={t('payment_info.business_type')}
            placeholder={t('payment_info.business_type_placeholder')}
            data={[
              { 
                value: BusinessType.PERSONAL, 
                label: t('payment_info.business_type_individual')
              },
              { 
                value: BusinessType.COMPANY, 
                label: t('payment_info.business_type_company')
              },
            ]}
            {...form.getInputProps('businessType')}
            withAsterisk
          />

          <TextInput
            label={t('payment_info.company_name')}
            placeholder={t('payment_info.company_name_placeholder')}
            {...form.getInputProps('name')}
          />

          <TextInput
            label={t('payment_info.company_address')}
            placeholder={t('payment_info.company_address_placeholder')}
            {...form.getInputProps('address')}
          />

          <TextInput
            label={t('payment_info.tax_number')}
            placeholder={t('payment_info.tax_number_placeholder')}
            {...form.getInputProps('taxNumber')}
          />
        </Stack>
      </Paper>
    </Box>
  );
};
