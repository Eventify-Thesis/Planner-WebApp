import { GenericModalProps } from '@/types/types.ts';
import { Modal } from '../../common/Modal';
import { CheckInListForm } from '../../forms/CheckInListForm';
import { useForm } from '@mantine/form';
import { Button } from '@mantine/core';
import { useCreateCheckInList } from '@/mutations/useCreateCheckInList';
import { showSuccess } from '@/utils/notifications.tsx';
import { useParams } from 'react-router-dom';
import { useFormErrorResponseHandler } from '@/hooks/useFormErrorResponseHandler.tsx';
import { NoResultsSplash } from '../../common/NoResultsSplash';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CheckInListRequest } from '@/domain/CheckInListModel';
import { useGetEventShow } from '@/queries/useGetEventShow.ts';

export const CreateCheckInListModal = ({ onClose }: GenericModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const { data: shows } = useGetEventShow(eventId);
  const errorHandler = useFormErrorResponseHandler();
  const form = useForm<CheckInListRequest>({
    initialValues: {
      name: '',
      description: '',
      expiresAt: '',
      activatesAt: '',
      showId: 0,
      ticketTypeIds: [],
    },
  });
  const createMutation = useCreateCheckInList();
  const hasShows = shows && shows.length > 0;

  const handleSubmit = (requestData: CheckInListRequest) => {
    createMutation.mutate(
      {
        eventId: eventId,
        checkInListData: requestData,
      },
      {
        onSuccess: () => {
          showSuccess(t`Check-In List created successfully`);
          onClose();
        },
        onError: (error) => errorHandler(form, error),
      },
    );
  };

  const NoTickets = () => {
    return (
      <NoResultsSplash
        imageHref={'/blank-slate/tickets.svg'}
        heading={t`Please create a ticket`}
        subHeading={
          <>
            <p>
              {t`You'll need a ticket before you can create a check-in list.`}
            </p>
            <Button
              size={'xs'}
              leftSection={<IconPlus />}
              color={'green'}
              onClick={() =>
                (window.location.href = `/manage/event/${eventId}/tickets/#create-ticket`)
              }
            >
              {t`Create a Ticket`}
            </Button>
          </>
        }
      />
    );
  };

  return (
    <Modal
      opened
      onClose={onClose}
      heading={hasShows ? t`Create Check-In List` : null}
    >
      {!hasShows && <NoTickets />}
      {hasShows && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <CheckInListForm form={form} eventId={eventId} shows={shows} />
          <Button type={'submit'} fullWidth loading={createMutation.isPending}>
            {t`Create Check-In List`}
          </Button>
        </form>
      )}
    </Modal>
  );
};
