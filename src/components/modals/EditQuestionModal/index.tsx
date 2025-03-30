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
import { useListTicketTypes } from '@/queries/useTicketTypeQueries';
import {
  useGetQuestion,
  useQuestionMutations,
} from '@/queries/useQuestionQueries';
import { showError } from '@/utils/notifications';
import React from 'react';
import { QuestionBelongsTo, QuestionModel } from '@/domain/QuestionModel';

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
  const { data: ticketTypesResponse } = useListTicketTypes(eventId!);
  const ticketTypes = ticketTypesResponse?.data || [];
  const { data: questionResponse, isLoading: isLoadingQuestion } =
    useGetQuestion(eventId!, questionId as string);
  const { updateQuestionMutation } = useQuestionMutations(eventId!);

  const form = useForm<QuestionModel>({
    initialValues: {
      title: '',
      description: '',
      type: QuestionType.SINGLE_LINE_TEXT,
      required: false,
      options: [],
      ticketTypeIds: [],
      belongsTo: QuestionBelongsTo.ORDER,
      isHidden: false,
    },
  });

  // Update form when question data is loaded
  React.useEffect(() => {
    if (questionResponse) {
      const question = questionResponse;
      form.setValues({
        title: question.title,
        description: question.description,
        type: question.type,
        required: question.required,
        options: question.options,
        ticketTypeIds: question.ticketTypeIds?.map((id) => String(id)),
        belongsTo: question.belongsTo,
        isHidden: question.isHidden,
      });
    }
  }, [questionResponse]);

  const handleSubmit = async (values: QuestionModel) => {
    try {
      const question = await updateQuestionMutation.mutateAsync({
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
        <QuestionForm form={form} ticketTypes={ticketTypes} />
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
