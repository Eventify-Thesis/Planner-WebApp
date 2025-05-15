import { GenericModalProps } from '@/types/types.ts';
import { hasLength, useForm } from '@mantine/form';
import { useParams } from 'react-router-dom';
import { useFormErrorResponseHandler } from '@/hooks/useFormErrorResponseHandler.tsx';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { useEffect } from 'react';
import { showError, showSuccess } from '@/utils/notifications.tsx';
import { LoadingMask } from '../../common/LoadingMask';
import { useGetVoucher } from '@/queries/useGetVoucher';
import { useGetEvent } from '@/queries/useGetEvent';
import { useTranslation } from 'react-i18next';
import { useUpdateVoucher } from '@/mutations/useUpdateVoucher';
import {
  VoucherCodeType,
  VoucherDiscountType,
  VoucherModel,
} from '@/domain/VoucherModel';
import { VoucherForm } from '@/components/forms/VoucherForm';

interface EditVoucherModalProps {
  voucherId: string;
}

export const EditVoucherModal = ({
  onClose,
  voucherId,
}: EditVoucherModalProps & GenericModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const errorHandler = useFormErrorResponseHandler();
  const voucherQuery = useGetVoucher(eventId!, voucherId);
  const eventQuery = useGetEvent(eventId!);

  const form = useForm<VoucherModel>({
    initialValues: {
      name: '',
      codeType: VoucherCodeType.SINGLE,
      discountType: VoucherDiscountType.PERCENT,
      discountValue: 0,
      quantity: 0,
      isUnlimited: false,
      maxOrderPerUser: 1,
      minQtyPerOrder: 1,
      maxQtyPerOrder: 1,
      discountCode: '',
      showingConfigs: [],
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

  const updateVoucherMutation = useUpdateVoucher();

  const handleSubmit = (values: VoucherModel) => {
    if (
      !values.isAllShowings &&
      (!values.showingConfigs || values.showingConfigs.length === 0)
    ) {
      showError(t('voucher.validation.at_least_one_ticket'));
      return;
    }

    updateVoucherMutation.mutate(
      {
        eventId: eventId!,
        voucherId: voucherId,
        voucherData: values,
      },
      {
        onSuccess: () => {
          onClose();
          showSuccess(t('voucher.edit.success'));
        },
        onError: (error) => errorHandler(form, error),
      },
    );
  };

  useEffect(() => {
    if (!voucherQuery.data) {
      return;
    }

    form.setValues({
      ...voucherQuery.data,
      discountValue: Number(voucherQuery.data.discountValue),
      startTime: new Date(voucherQuery.data.startTime),
      endTime: new Date(voucherQuery.data.endTime),
    });
  }, [voucherQuery.data]);

  if (voucherQuery.isLoading || eventQuery.isLoading) {
    return <LoadingMask />;
  }

  if (voucherQuery.isError) {
    return <div>{t('voucher.error.load_failed')}</div>;
  }

  return (
    <Modal opened onClose={onClose} title={t('voucher.edit.title')}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <VoucherForm form={form} />
        <Button
          type="submit"
          fullWidth
          mt="xl"
          loading={updateVoucherMutation.isPending}
        >
          {updateVoucherMutation.isPending
            ? t('common.working')
            : t('voucher.edit.submit')}
        </Button>
      </form>
    </Modal>
  );
};
