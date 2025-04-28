import { Modal } from '../../common/Modal';
import { GenericModalProps } from '@/types/types.ts';
import { Button } from '../../common/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormErrorResponseHandler } from '../../../hooks/useFormErrorResponseHandler.tsx';
import { useForm } from '@mantine/form';
import {
  LoadingOverlay,
  NumberInput,
  Select,
  Switch,
  TextInput,
} from '@mantine/core';
import { useGetEvent } from '@/queries/useGetEvent.ts';
import { CreateAttendeeRequest } from '@/api/attendee.client.ts';
import { useCreateAttendee } from '@/mutations/useCreateAttendee.ts';
import { showSuccess } from '@/utils/notifications.tsx';
import { useEffect } from 'react';
import { InputGroup } from '../../common/InputGroup';
import { Trans, useTranslation } from 'react-i18next';
import { useGetEventTicketTypes } from '@/queries/useGetEventTicketTypes.ts';

export const CreateAttendeeModal = ({ onClose }: GenericModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const { data: ticketTypes, isFetched: isTicketTypesFetched } =
    useGetEventTicketTypes({ eventId });
  const errorHandler = useFormErrorResponseHandler();
  const mutation = useCreateAttendee();
  const navigate = useNavigate();

  const form = useForm<CreateAttendeeRequest>({
    initialValues: {
      ticketTypeId: undefined,
      email: '',
      firstName: '',
      lastName: '',
      amountPaid: 0.0,
      sendConfirmationEmail: true,
    },
  });

  useEffect(() => {
    if (ticketTypes) {
      form.setFieldValue(
        'ticket_price_id',
        String(
          ticketTypes?.find(
            (ticketType) => ticketType.id == form.values.ticketTypeId,
          )?.price,
        ),
      );
    }
  }, [form.values.ticketTypeId]);

  const handleSubmit = (values: CreateAttendeeRequest) => {
    mutation.mutate(
      {
        eventId: eventId,
        attendeeData: values,
      },
      {
        onSuccess: () => {
          showSuccess(t`Successfully created attendee`);
          onClose();
        },
        onError: (error) => errorHandler(form, error),
      },
    );
  };

  if (!ticketTypes) {
    return <LoadingOverlay visible />;
  }

  if (isTicketTypesFetched && ticketTypes.length === 0) {
    return (
      <Modal opened onClose={onClose} heading={t`Manually Add Attendee`}>
        <p>{t`You must create a ticket before you can manually add an attendee.`}</p>
        <Button
          fullWidth
          variant={'light'}
          onClick={() => {
            navigate(`/manage/event/${eventId}/tickets`);
          }}
        >
          {t`Manage tickets`}
        </Button>
      </Modal>
    );
  }

  return (
    <Modal opened onClose={onClose} heading={t`Manually Add Attendee`}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <InputGroup>
          <TextInput
            {...form.getInputProps('firstName')}
            label={t`First name`}
            placeholder={t`Patrick`}
            required
          />

          <TextInput
            {...form.getInputProps('lastName')}
            label={t`Last name`}
            placeholder={t`Johnson`}
            required
          />
        </InputGroup>
        <TextInput
          {...form.getInputProps('email')}
          label={t`Email address`}
          placeholder={t`patrick@acme.com`}
          required
        />

        <Select
          label={t`Ticket`}
          mt={20}
          description={t`Manually adding an attendee will adjust ticket quantity.`}
          placeholder={t`Select Ticket`}
          {...form.getInputProps('ticketTypeId')}
          data={ticketTypes?.map((ticketType) => {
            return {
              value: String(ticketType.id),
              label: ticketType.name,
            };
          })}
        />

        {/* {ticketTypes?.find(
          (ticketType) => ticketType.id == form.values.ticketTypeId,
        )?.type === 'TIERED' && (
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

        <NumberInput
          required
          mt={20}
          fixedDecimalScale
          {...form.getInputProps('amountPaid')}
          label={<Trans>Amount paid ({'VND'})</Trans>}
          placeholder="0.00"
          decimalScale={2}
          step={1}
          min={0}
          description={t`Enter an amount excluding taxes and fees.`}
        />

        <Switch
          mt={20}
          label={t`Send order confirmation and ticket email`}
          {...form.getInputProps('sendConfirmationEmail', {
            type: 'checkbox',
          })}
        />
        <Button type="submit" fullWidth mt="xl" disabled={mutation.isPending}>
          {mutation.isPending ? t`Working` + '...' : t`Create Attendee`}
        </Button>
      </form>
    </Modal>
  );
};
