import { useParams } from 'react-router-dom';
import { Modal } from '../../common/Modal';
import { Alert, Button, LoadingOverlay } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import classes from './CancelOrderModal.module.scss';
import { OrderDetails } from '../../common/OrderDetails';
import { AttendeeList } from '../../common/AttendeeList';
import { showError, showSuccess } from '../../../utils/notifications.tsx';
import { GenericModalProps, IdParam } from '@/types/types.ts';
import { useTranslation } from 'react-i18next';
import { useCancelOrder } from '@/mutations/useCancelOrder.ts';
import { useGetOrder } from '@/queries/useGetOrder.ts';
import { TicketTypeModel } from '@/domain/TicketTypeModel.ts';

interface RefundOrderModalProps extends GenericModalProps {
  orderId: IdParam;
  ticketTypes?: TicketTypeModel[];
}

export const CancelOrderModal = ({
  onClose,
  orderId,
  ticketTypes,
}: RefundOrderModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  // const queryClient = useQueryClient();
  const { data: order } = useGetOrder(eventId, orderId);
  const cancelOrderMutation = useCancelOrder();

  const handleCancelOrder = () => {
    cancelOrderMutation.mutate(
      { eventId, orderId },
      {
        onSuccess: () => {
          showSuccess(
            t`Order has been canceled and the order owner has been notified.`,
          );
          onClose();
        },
        onError: (error: any) => {
          showError(
            error?.response?.data?.message || t`Failed to cancel order`,
          );
        },
      },
    );
  };

  if (!order) {
    return <LoadingOverlay visible />;
  }

  return (
    <Modal heading={t(`Cancel Order ${order.id}`)} opened onClose={onClose}>
      <OrderDetails order={order} />

      {ticketTypes && <AttendeeList order={order} ticketTypes={ticketTypes} />}

      <Alert
        className={classes.alert}
        variant="light"
        color="blue"
        title={t`Please Note`}
        icon={<IconInfoCircle />}
      >
        {t`Canceling will cancel all tickets associated with this order, and release the tickets back into the available pool.`}
      </Alert>

      <Button
        loading={cancelOrderMutation.isPending}
        className={'mb20'}
        color={'red'}
        fullWidth
        onClick={handleCancelOrder}
      >
        {t`Cancel Order`}
      </Button>
    </Modal>
  );
};
