import { MultiSelect, Select, Textarea, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { UseFormReturnType } from '@mantine/form';
import { CheckInListRequest } from '@/domain/CheckInListModel';
import { InputLabelWithHelp } from '../../common/InputLabelWithHelp';
import { InputGroup } from '../../common/InputGroup';
import { IconTicket, IconCalendarEvent } from '@tabler/icons-react';
import { useGetEventTicketTypes } from '@/queries/useGetEventTicketTypes';
import { ShowModel } from '@/domain/ShowModel';
import { formatDate } from '@/utils/dates';

interface CheckInListFormProps {
  form: UseFormReturnType<CheckInListRequest>;
  eventId: string;
  shows: ShowModel;
}

export const CheckInListForm = ({
  form,
  eventId,
  shows,
}: CheckInListFormProps) => {
  const { t } = useTranslation();
  const { data: ticketTypes } = useGetEventTicketTypes(
    eventId,
    form.values.showId,
  );
  return (
    <>
      <TextInput
        {...form.getInputProps('name')}
        required
        label={t`Name`}
        placeholder={t`VIP check-in list`}
      />

      <Select
        label={t`Which show is this check-in list for?`}
        placeholder={t`Select a show`}
        data={
          shows?.map((show) => ({
            value: String(show.id),
            label: formatDate(
              show.startTime,
              'YYYY-MM-DD HH:mm',
              'Asia/Bangkok',
            ),
          })) ?? []
        }
        required
        leftSection={<IconCalendarEvent size="1rem" />}
        {...form.getInputProps('showId')}
      />

      <MultiSelect
        label={t`Which ticket types should be associated with this check-in list?`}
        multiple
        placeholder={t`Select ticket types`}
        data={
          ticketTypes?.map((ticketType) => ({
            value: String(ticketType.id),
            label: ticketType.name,
          })) ?? []
        }
        required
        disabled={!form.values.showId}
        leftSection={<IconTicket size="1rem" />}
        {...form.getInputProps('ticketTypeIds')}
      />

      <Textarea
        {...form.getInputProps('description')}
        label={
          <InputLabelWithHelp
            label={t`Description for check-in staff`}
            helpText={t`This description will be shown to the check-in staff`}
          />
        }
        placeholder={t`Add a description for this check-in list`}
      />

      <InputGroup>
        <TextInput
          {...form.getInputProps('activatesAt')}
          type="datetime-local"
          label={
            <InputLabelWithHelp
              label={t`Activation date`}
              helpText={t`No attendees will be able to check in before this date using this list`}
            />
          }
          placeholder={t`What date should this check-in list become active?`}
        />
        <TextInput
          {...form.getInputProps('expiresAt')}
          type="datetime-local"
          label={
            <InputLabelWithHelp
              label={t`Expiration date`}
              helpText={t`This list will no longer be available for check-ins after this date`}
            />
          }
          placeholder={t`When should this check-in list expire?`}
        />
      </InputGroup>
    </>
  );
};
