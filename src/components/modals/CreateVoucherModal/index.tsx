import { GenericModalProps } from '@/types/types.ts';
import { hasLength, useForm } from '@mantine/form';
import { useParams } from 'react-router-dom';
import { useFormErrorResponseHandler } from '@/hooks/useFormErrorResponseHandler.tsx';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { showError, showSuccess } from '@/utils/notifications.tsx';
import { useTranslation } from 'react-i18next';
import { VoucherForm } from '@/components/forms/VoucherForm';
import {
  VoucherCodeType,
  VoucherDiscountType,
  VoucherModel,
  VoucherStatus,
} from '@/domain/VoucherModel';
import { useCreateVoucher } from '@/mutations/useCreateVoucher';

export const CreateVoucherModal = ({ onClose }: GenericModalProps) => {
  const { eventId } = useParams();
  const { t } = useTranslation();
  const errorHandler = useFormErrorResponseHandler();
  const mutation = useCreateVoucher();

  const form = useForm<VoucherModel>({
    initialValues: {
      name: '',
      codeType: VoucherCodeType.SINGLE,
      discountType: VoucherDiscountType.FIXED,
      discountValue: 0,
      quantity: 0,
      isUnlimited: false,
      maxOrderPerUser: 1,
      minQtyPerOrder: 1,
      maxQtyPerOrder: 1,
      discountCode: '',
      showings: [],
      isAllShowings: false,
      startTime: new Date(),
      endTime: new Date(),
    },
    validate: {
      name: hasLength({ min: 3, max: 50 }, t('voucher.validation.name_length')),
      discountCode: hasLength(
        { min: 3, max: 50 },
        t('voucher.validation.code_length'),
      ),
    },
    validateInputOnBlur: true,
  });

  const handleSubmit = (values: VoucherModel) => {
    if (
      !values.isAllShowings &&
      (!values.showings || values.showings.length === 0)
    ) {
      showError(t('voucher.validation.at_least_one_ticket'));
      return;
    }

    mutation.mutate(
      {
        eventId: eventId!,
        voucherData: {
          ...values,
          status: VoucherStatus.ACTIVE,
          discountType: values.discountType as VoucherDiscountType,
        },
      },
      {
        onSuccess: () => {
          showSuccess(t('voucher.create.success'));
          form.reset();
          onClose();
        },
        onError: (error) => errorHandler(form, error),
      },
    );
  };

  return (
    <Modal opened onClose={onClose} heading={t('voucher.create.title')}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <VoucherForm form={form} />
        <Button type="submit" fullWidth mt="xl" loading={mutation.isPending}>
          {mutation.isPending
            ? t('common.working')
            : t('voucher.create.submit')}
        </Button>
      </form>
    </Modal>
  );
};
