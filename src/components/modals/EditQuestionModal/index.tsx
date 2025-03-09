import { Button, LoadingOverlay } from '@mantine/core';
import {
  GenericModalProps,
  IdParam,
  Question,
  QuestionRequestData,
  QuestionType,
} from '@/types/types.ts';
import { useForm } from '@mantine/form';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
// import { questionClient } from '../../../api/question.client.ts';
// import { useGetEvent } from '../../../queries/useGetEvent.ts';
// import { GET_EVENT_QUESTIONS_QUERY_KEY } from '../../../queries/useGetEventQuestions.ts';
import { Modal } from '../../common/Modal';
import { QuestionForm } from '../../forms/QuestionForm';
// import {
//   GET_QUESTION_QUERY_KEY,
//   useGetQuestion,
// } from '../../../queries/useGetQuestion.ts';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TicketModel } from '@/domain/TicketModel';
import { listTicketsAPI } from '@/api/events.api';
import { getQuestionAPI, updateQuestionAPI } from '@/api/questions.api';
import { showError } from '@/utils/notifications';

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
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  useEffect(() => {
    const getTickets = async () => {
      const tickets = await listTicketsAPI(eventId!);
      setTickets(tickets);
    };
    getTickets();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    setIsLoading(true);
    const getQuestion = async () => {
      const question = await getQuestionAPI(eventId!, questionId as string);
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
      setIsLoading(false);
    };
    getQuestion();
  }, []);

  const updateQuestion = async (questionData: QuestionRequestData) => {
    setIsLoading(true);
    try {
      const response = await updateQuestionAPI(
        eventId!,
        questionId as string,
        questionData,
      );

      console.log(questionData);
      notifications.show({
        message: t('questions.edit.success'),
        color: 'green',
      });
      await reloadQuestions();
      onClose();
      setIsLoading(false);
    } catch (error) {
      showError(t('questions.edit.error'));
    }
  };

  //   useEffect(() => {
  //     const { data } = questionQuery;

  //     if (!data) {
  //       return;
  //     }

  //     form.setValues({
  //       title: data.title,
  //       description: data.description,
  //       type: data.type,
  //       required: data.required,
  //       options: data.options,
  //       ticket_ids: data.ticket_ids?.map((id) => String(id)),
  //       belongs_to: data.belongs_to,
  //       isHidden: data.isHidden,
  //     });
  //   }, [questionQuery.isFetched]);

  //   const mutation = useMutation({
  //     mutationFn: (questionData: Question) =>
  //       questionClient.update(eventId, questionId, questionData),

  //     onSuccess: () => {
  //       notifications.show({
  //         message: t`Successfully Created Question`,
  //         color: 'green',
  //       });
  //       queryClient
  //         .invalidateQueries({
  //           queryKey: [GET_EVENT_QUESTIONS_QUERY_KEY, eventId],
  //         })
  //         .then(() => {
  //           form.reset();
  //           onClose();
  //         })
  //         .then(() => {
  //           queryClient.invalidateQueries({
  //             queryKey: [GET_QUESTION_QUERY_KEY, eventId, questionId],
  //           });
  //         });
  //     },

  //     onError: (error: any) => {
  //       if (error?.response?.data?.errors) {
  //         form.setErrors(error.response.data.errors);
  //       }
  //       notifications.show({
  //         message: t`Unable to update question. Please check the your details`,
  //         color: 'red',
  //       });
  //     },
  //   });

  return (
    <Modal opened onClose={onClose} heading={t('questions.edit.title')}>
      <form onSubmit={form.onSubmit((values) => updateQuestion(values))}>
        <QuestionForm form={form} tickets={tickets} />
        {isLoading && <LoadingOverlay visible />}
        <Button loading={isLoading} type="submit" fullWidth mt="xl">
          {isLoading ? t('questions.edit.working') : t('questions.edit.title')}
        </Button>
      </form>
    </Modal>
  );
};
