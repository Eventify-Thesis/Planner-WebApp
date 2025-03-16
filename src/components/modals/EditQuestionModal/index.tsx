import { Button, LoadingOverlay } from '@mantine/core';
import {
  GenericModalProps,
  IdParam,
  QuestionRequestData,
  QuestionType,
} from '@/types/types.ts';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import { Modal } from '../../common/Modal';
import { QuestionForm } from '../../forms/QuestionForm';
import { useTranslation } from 'react-i18next';
import { useListTickets } from '@/queries/useTicketQueries';
import { useGetQuestion, useQuestionMutations } from '@/queries/useQuestionQueries';
import { showError } from '@/utils/notifications';
import React from 'react';

interface EditQuestionModalProps extends GenericModalProps {
  questionId: IdParam;
  reloadQuestions: () => Promise<void>;
}

export const EditQuestionModal = ({
  onClose,
  questionId,
  reloadQuestions,
}: EditQuestionModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const { data: ticketsResponse } = useListTickets(eventId!);
  const tickets = ticketsResponse?.data || [];
  const { data: questionResponse, isLoading: isLoadingQuestion } = useGetQuestion(
    eventId!,
    questionId as string
  );
  const { updateQuestionMutation } = useQuestionMutations(eventId!);

  const form = useForm<QuestionRequestData>({
    initialValues: {
      title: '',
      description: '',
      type: QuestionType.SINGLE_LINE_TEXT.toString(),
      required: false,
      options: [],
      ticketIds: [],
      belongsTo: 'ORDER',
      isHidden: false,
    },
  });

  // Update form when question data is loaded
  React.useEffect(() => {
    if (questionResponse?.data) {
      const question = questionResponse.data;
      form.setValues({
        title: question.title,
        description: question.description,
        type: question.type,
        required: question.required,
        options: question.options,
        ticketIds: question.ticketIds?.map((id) => String(id)),
        belongsTo: question.belongsTo,
        isHidden: question.isHidden,
      });
    }
  }, [questionResponse]);

  const handleSubmit = async (values: QuestionRequestData) => {
    try {
      const { data: question } = await updateQuestionMutation.mutateAsync({
        questionId: questionId as string,
        data: values,
      });
      notifications.show({
        message: t('questions.edit.success'),
        color: 'green',
      });
      onClose();
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        form.setErrors(error.response.data.errors);
      }
      showError(t('questions.edit.error'));
    }
  };

  return (
    <Modal opened onClose={onClose} heading={t('questions.edit.title')}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <QuestionForm form={form} tickets={tickets} />
        {isLoadingQuestion && <LoadingOverlay visible />}
        <Button
          loading={updateQuestionMutation.isPending}
          type="submit"
          fullWidth
          mt="xl"
        >
          {updateQuestionMutation.isPending
            ? t('questions.edit.working')
            : t('questions.edit.title')}
        </Button>
      </form>
    </Modal>
  );
};
