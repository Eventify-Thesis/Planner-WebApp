import { Modal } from '../../common/Modal';
import { GenericModalProps } from '@/types/types.ts';
import { Button } from '../../common/Button';
import { useParams } from 'react-router-dom';
import { useFormErrorResponseHandler } from '../../../hooks/useFormErrorResponseHandler.tsx';
import { useForm } from '@mantine/form';
import { LoadingOverlay, Select, TextInput } from '@mantine/core';
import { EditAttendeeRequest } from '../../../api/attendee.client.ts';
import { useGetAttendee } from '../../../queries/useGetAttendee.ts';
import { useEffect } from 'react';
import { useUpdateAttendee } from '@/mutations/useUpdateAttendee.ts';
import { showSuccess } from '../../../utils/notifications.tsx';
import { useGetEvent } from '../../../queries/useGetEvent.ts';
import { IconInfoCircle } from '@tabler/icons-react';
import { InputGroup } from '../../common/InputGroup';
import { useTranslation } from 'react-i18next';
import { useGetEventTicketTypes } from '@/queries/useGetEventTicketTypes.ts';

interface EditAttendeeModalProps extends GenericModalProps {
  attendeeId: number;
}

export const EditAttendeeModal = ({
  onClose,
  attendeeId,
}: EditAttendeeModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const errorHandler = useFormErrorResponseHandler();
  const { data: attendee, isFetched } = useGetAttendee(eventId, attendeeId);
  const { data: ticketTypes, isLoading: ticketTypesLoading } =
    useGetEventTicketTypes({ eventId });
  const mutation = useUpdateAttendee();
  const form = useForm<EditAttendeeRequest>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      ticketTypeId: '',
    },
  });

  useEffect(() => {
    if (!attendee) {
      return;
    }

    form.setValues({
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      email: attendee.email,
      ticketTypeId: String(attendee.ticketTypeId),
    });
  }, [isFetched]);

  useEffect(() => {
    if (!form.values.ticketTypeId) {
      return;
    }
  }, [form.values.ticketTypeId]);

  const handleSubmit = (values: EditAttendeeRequest) => {
    mutation.mutate(
      {
        attendeeId: attendeeId,
        eventId: eventId,
        attendeeData: values,
      },
      {
        onSuccess: () => {
          showSuccess(t`Successfully updated attendee`);
          onClose();
        },
        onError: (error) => errorHandler(form, error),
      },
    );
  };

  if (!isFetched) {
    return <LoadingOverlay visible />;
  }

  return (
    <Modal opened onClose={onClose} heading={t`Edit Attendee`}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <InputGroup>
          <TextInput
            {...form.getInputProps('firstName')}
            label={t`First name`}
            placeholder={t`Homer`}
            required
          />

          <TextInput
            {...form.getInputProps('lastName')}
            label={t`Last name`}
            placeholder={t`Simpson`}
            required
          />
        </InputGroup>
        <TextInput
          {...form.getInputProps('email')}
          label={t`Email address`}
          placeholder="homer@simpson.com"
          required
        />

        {ticketTypes && (
          <Select
            mt={20}
            description={
              <>
                <IconInfoCircle size={12} /> Changing an attendee's tickets will
                adjust ticket quantities
              </>
            }
            data={ticketTypes.map((ticketType) => {
              return {
                value: String(ticketType.id),
                label: ticketType.name,
              };
            })}
            {...form.getInputProps('ticket_id')}
            label={t`Ticket`}
            required
          />
        )}

        {/* {ticketTypes?.find((ticketType) => ticketType.id == form.values.ticket_id)
          ?.type === 'TIERED' && (
          <Select
            label={t`Ticket Tier`}
            mt={20}
            placeholder={t`Select Ticket Tier`}
            {...form.getInputProps('ticket_price_id')}
            data={event?.tickets
              ?.find((ticket) => ticket.id == form.values.ticket_id)
              ?.prices?.map((price) => {
                return {
                  value: String(price.id),
                  label: String(price.label),
                };
              })}
          />
        )} */}

        <Button type="submit" fullWidth mt="xl" disabled={mutation.isPending}>
          {mutation.isPending ? t`Working...` : t`Edit Attendee`}
        </Button>
      </form>
    </Modal>
  );
};
