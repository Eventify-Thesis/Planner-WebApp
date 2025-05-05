import { GenericModalProps, IdParam } from '@/types/types.ts';
import { Modal } from '../../common/Modal';
import { CheckInListForm } from '../../forms/CheckInListForm';
import { useForm } from '@mantine/form';
import { Alert, Button, Center, Loader } from '@mantine/core';
import { showSuccess } from '@/utils/notifications.tsx';
import { useParams } from 'react-router-dom';
import { useFormErrorResponseHandler } from '@/hooks/useFormErrorResponseHandler.tsx';
import { useEditCheckInList } from '@/mutations/useEditCheckInList.ts';
import { useGetEventCheckInList } from '@/queries/useGetCheckInList.ts';
import { useEffect } from 'react';
import { utcToTz } from '@/utils/dates.ts';
import { CheckInListRequest } from '@/domain/CheckInListModel.ts';
import { useTranslation } from 'react-i18next';
import { useGetEventShow } from '@/queries/useGetEventShow';

interface EditCheckInListModalProps {
  checkInListId: IdParam;
}

export const EditCheckInListModal = ({
  onClose,
  checkInListId,
}: GenericModalProps & EditCheckInListModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const errorHandler = useFormErrorResponseHandler();
  const {
    data: checkInList,
    error: checkInListError,
    isLoading: checkInListLoading,
  } = useGetEventCheckInList(checkInListId, eventId);
  const { data: shows } = useGetEventShow(eventId);
  const form = useForm<CheckInListRequest>({
    initialValues: {
      name: '',
      expiresAt: '',
      showId: 0,
      activatesAt: '',
      description: '',
      ticketTypeIds: [],
    },
  });
  const editMutation = useEditCheckInList();

  const handleSubmit = (requestData: CheckInListRequest) => {
    editMutation.mutate(
      {
        eventId: eventId,
        checkInListData: requestData,
        checkInListId: checkInListId,
      },
      {
        onSuccess: () => {
          showSuccess(t('Successfully updated Check-In List'));
          onClose();
        },
        onError: (error) => errorHandler(form, error),
      },
    );
  };

  useEffect(() => {
    if (checkInList && event) {
      form.setValues({
        name: checkInList.name,
        description: checkInList.description,
        expiresAt: utcToTz(checkInList.expiresAt, 'Asia/Bangkok'),
        activatesAt: utcToTz(checkInList.activatesAt, 'Asia/Bangkok'),
        showId: checkInList.showId,
        ticketTypeIds: checkInList.ticketTypes?.map((ticketType) =>
          String(ticketType.id),
        ),
      });
    }
  }, [checkInList]);

  return (
    <Modal opened onClose={onClose} heading={t('Edit Check-In List')}>
      {checkInListLoading && (
        <Center>
          <Loader />
        </Center>
      )}

      {!!checkInListError && (
        <Alert color={'red'}>{t('Failed to load Check-In List')}</Alert>
      )}

      {checkInList && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <CheckInListForm form={form} eventId={eventId!} shows={shows ?? []} />
          <Button type={'submit'} fullWidth loading={editMutation.isPending}>
            {t('Edit Check-In List')}
          </Button>
        </form>
      )}
    </Modal>
  );
};
