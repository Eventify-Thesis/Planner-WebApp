import { useParams } from 'react-router-dom';
import { Modal } from '../../common/Modal';
import { Card } from '../../common/Card';
import { AttendeeList } from '../../common/AttendeeList';
import { OrderDetails } from '../../common/OrderDetails';
import { QuestionAndAnswerList } from '../../common/QuestionAndAnswerList';
import { GenericModalProps, IdParam } from '@/types/types.ts';
import { Trans, useTranslation } from 'react-i18next';
import { useGetOrder } from '@/queries/useGetOrder.ts';
import { OrderSummary } from '@/components/common/OrderSummary/index.tsx';
import { TicketTypeModel } from '@/domain/TicketTypeModel.ts';

interface ViewOrderModalProps {
  orderId: IdParam;
  ticketTypes: TicketTypeModel[];
}

export const ViewOrderModal = ({
  onClose,
  orderId,
  ticketTypes,
}: GenericModalProps & ViewOrderModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const { data: order } = useGetOrder(eventId, orderId);

  if (!order) {
    return null;
  }

  return (
    <Modal
      opened={true}
      onClose={onClose}
      heading={<Trans>Order Details {order.id}</Trans>}
    >
      <OrderDetails order={order} />

      <h3>{t`Order Summary`}</h3>
      <Card variant={'lightGray'}>
        <OrderSummary order={order} />
      </Card>

      {order.bookingAnswers && order.bookingAnswers.length > 0 && (
        <>
          <h3>{t`Questions`}</h3>
          <QuestionAndAnswerList questionAnswers={order.bookingAnswers} />
        </>
      )}

      {ticketTypes && (
        <>
          <h3>{t`Attendees`}</h3>
          {order.attendees.length > 0 ? (
            <AttendeeList order={order} ticketTypes={ticketTypes} />
          ) : (
            <p>{t`No attendees`}</p>
          )}
        </>
      )}
    </Modal>
  );
};
