import { useParams } from 'react-router-dom';
import { useGetAttendee } from '../../../queries/useGetAttendee.ts';
import { Modal } from '../../common/Modal';
import { GenericModalProps, IdParam } from '@/types/types.ts';
import { OrderDetails } from '../../common/OrderDetails';
import { useGetEvent } from '../../../queries/useGetEvent.ts';
import { useGetOrder } from '../../../queries/useGetOrder.ts';
import { AttendeeDetails } from '../../common/AttendeeDetails';
import { QuestionAndAnswerList } from '../../common/QuestionAndAnswerList';
import { LoadingMask } from '../../common/LoadingMask';
import { AttendeeTicket } from '../../common/AttendeeTicket';
import { useTranslation } from 'react-i18next';

interface ViewAttendeeModalProps extends GenericModalProps {
  onClose: () => void;
  attendeeId: IdParam;
}

export const ViewAttendeeModal = ({
  onClose,
  attendeeId,
}: ViewAttendeeModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();

  const attendee = useGetAttendee(eventId, attendeeId).data;
  const order = useGetOrder(eventId, attendee?.orderId).data;
  const event = useGetEvent(eventId).data;

  if (!attendee || !order || !event) {
    return <LoadingMask />;
  }

  return (
    <Modal
      opened
      onClose={onClose}
      withCloseButton
      heading={attendee ? `${attendee.firstName} ${attendee.lastName}` : ''}
    >
      <h3>{t`Attendee Details`}</h3>
      {attendee && event && <AttendeeDetails attendee={attendee} />}

      <h3>{t`Order Details`}</h3>
      {order && event && <OrderDetails order={order} event={event} />}

      {attendee.bookingAnswers && attendee.bookingAnswers.length > 0 && (
        <>
          <h3>{t`Questions`}</h3>
          <QuestionAndAnswerList questionAnswers={attendee.bookingAnswers} />
        </>
      )}

      <h3>{t`Ticket`}</h3>

      {attendee?.ticketType && (
        <AttendeeTicket
          event={event}
          attendee={attendee}
          ticketType={attendee.ticketType}
        />
      )}
    </Modal>
  );
};
