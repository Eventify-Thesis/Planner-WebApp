import { useParams } from 'react-router-dom';
// import { useGetEvent } from '../../../queries/useGetEvent.ts';
// import { useGetOrder } from '../../../queries/useGetOrder.ts';
import { Modal } from '../../common/Modal';
import {
  Alert,
  Button,
  ComboboxItemGroup,
  LoadingOverlay,
  MultiSelect,
  Select,
  Switch,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle, IconSend } from '@tabler/icons-react';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useFormErrorResponseHandler } from '../../../hooks/useFormErrorResponseHandler.tsx';
import { showSuccess } from '../../../utils/notifications.tsx';
import { Editor } from '../../common/Editor';
import { GenericModalProps, IdParam, MessageType } from '@/types/types.ts';
import { useGetOrder } from '@/queries/useGetOrder.ts';
import { Trans, useTranslation } from 'react-i18next';
import { useGetEventTicketTypes } from '@/queries/useGetEventTicketTypes.ts';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useSendEventMessage } from '@/mutations/useSendEventMessage.ts';
// import { useSendEventMessage } from '../../../mutations/useSendEventMessage.ts';

interface EventMessageModalProps extends GenericModalProps {
  orderId?: IdParam;
  ticketTypeId?: IdParam;
  messageType: MessageType;
  attendeeId?: IdParam;
}

const OrderField = ({
  orderId,
  eventId,
}: {
  orderId: IdParam;
  eventId: IdParam;
}) => {
  const { t } = useTranslation();
  const { data: order } = useGetOrder(eventId, orderId);

  if (!order) {
    return null;
  }

  return (
    <TextInput
      mt={20}
      label={t`Recipient`}
      disabled
      placeholder={`${order.firstName} ${order.lastName} <${order.email}>`}
    />
  );
};

const AttendeeField = ({
  orderId,
  eventId,
  attendeeId,
  form,
}: {
  orderId: IdParam;
  eventId: IdParam;
  attendeeId: IdParam;
  form: UseFormReturnType<any>;
}) => {
  const { t } = useTranslation();

  const { data: order } = useGetOrder(eventId, orderId);
  const { data: ticketTypes } = useGetEventTicketTypes({ eventId });

  if (!order || !ticketTypes || !attendeeId) {
    return null;
  }

  const groups: ComboboxItemGroup[] = ticketTypes.map((ticketType) => {
    return {
      group: ticketType.name,
      items:
        order.attendees
          ?.filter((a) => a.ticketTypeId === ticketType.id)
          .map((attendee) => {
            return {
              value: String(attendee.id),
              label: attendee.firstName + ' ' + attendee.lastName,
            };
          }) || [],
    };
  });

  return (
    <MultiSelect
      mt={20}
      label={t`Message individual attendees`}
      searchable
      data={groups}
      {...form.getInputProps('attendee_ids')}
    />
  );
};

export const SendMessageModal = (props: EventMessageModalProps) => {
  const { user } = useUser();
  const { t } = useTranslation();
  const { onClose, orderId, ticketTypeId, messageType, attendeeId } = props;
  const { eventId } = useParams();
  const { data: ticketTypes } = useGetEventTicketTypes({ eventId });
  const errorHandler = useFormErrorResponseHandler();
  const isPreselectedRecipient = !!(orderId || attendeeId || ticketTypeId);
  const isAccountVerified = true;
  const sendMessageMutation = useSendEventMessage();

  const form = useForm({
    initialValues: {
      subject: '',
      message: '',
      messageType: messageType,
      attendeeIds: attendeeId ? [String(attendeeId)] : [],
      ticketTypeIds: ticketTypeId ? [String(ticketTypeId)] : [],
      orderId: orderId,
      isTest: false,
      sendCopyToCurrentUser: false,
      type: 'EVENT',
      acknowledgement: false,
    },
    validate: {
      acknowledgement: (value) =>
        value === true
          ? null
          : t`You must acknowledge that this email is not promotional`,
    },
  });

  const handleSend = (values: any) => {
    sendMessageMutation.mutate(
      {
        eventId: eventId,
        messageData: values,
      },
      {
        onSuccess: () => {
          showSuccess(t`Message Sent`);
          form.reset();
          onClose();
        },
        onError: (error: any) => errorHandler(form, error),
      },
    );
  };

  return (
    <Modal withCloseButton opened onClose={onClose} heading={t`Send a message`}>
      <form onSubmit={form.onSubmit(handleSend)}>
        {!isAccountVerified && (
          <Alert
            mt={20}
            variant={'light'}
            icon={<IconAlertCircle size="1rem" />}
          >
            {t`You need to verify your account before you can send messages.`}
          </Alert>
        )}
        <fieldset disabled={!isAccountVerified}>
          {!isPreselectedRecipient && (
            <Select
              mt={20}
              data={[
                {
                  value: 'TICKET',
                  label: t`Attendees with a specific ticket`,
                },
                {
                  value: 'EVENT',
                  label: t`All attendees of this event`,
                },
              ]}
              label={t`Who is this message to?`}
              placeholder={t`Please select`}
              {...form.getInputProps('messageType')}
            />
          )}

          {form.values.messageType === MessageType.Attendee &&
            attendeeId &&
            orderId && (
              <AttendeeField
                eventId={eventId}
                orderId={orderId}
                attendeeId={attendeeId}
                form={form}
              />
            )}

          {form.values.messageType === MessageType.Ticket && ticketTypes && (
            <MultiSelect
              mt={20}
              label={t`Message attendees with specific tickets`}
              searchable
              data={ticketTypes?.map((ticketType) => {
                return {
                  value: String(ticketType.id),
                  label: ticketType.name,
                };
              })}
              {...form.getInputProps('ticketTypeIds')}
            />
          )}

          {form.values.messageType === MessageType.Order && orderId && (
            <OrderField orderId={orderId} eventId={eventId} />
          )}

          <TextInput
            required
            mt={20}
            label={t`Subject`}
            {...form.getInputProps('subject')}
          />

          <Editor
            label={t`Message Content`}
            value={form.values.message || ''}
            onChange={(value) => form.setFieldValue('message', value)}
            error={form.errors.message as string}
          />

          <Switch
            mt={20}
            label={
              <Trans>
                Send a copy to <b>{user?.emailAddresses[0].emailAddress}</b>
              </Trans>
            }
            {...form.getInputProps('sendCopyToCurrentUser')}
          />

          <Switch
            mt={20}
            label={
              <Trans>
                Send as a test. This will send the message to your email address
                instead of the recipients.
              </Trans>
            }
            {...form.getInputProps('isTest')}
          />

          <Alert
            variant={'outline'}
            mt={20}
            icon={<IconAlertCircle size="1rem" />}
            title={t`Before you send!`}
          >
            {t`Only important emails, which are directly related to this event, should be sent using this form.
                         Any misuse, including sending promotional emails, will lead to an immediate account ban.`}
          </Alert>

          <Switch
            mt={20}
            {...form.getInputProps('acknowledgement', { type: 'checkbox' })}
            label={
              <Trans>
                This email is not promotional and is directly related to the
                event.
              </Trans>
            }
          />

          <Button
            mt={20}
            loading={sendMessageMutation.isPending}
            type={'submit'}
            fullWidth
            leftSection={<IconSend />}
          >
            {form.values.isTest ? t`Send Test` : t`Send`}
          </Button>
        </fieldset>
      </form>
    </Modal>
  );
};
