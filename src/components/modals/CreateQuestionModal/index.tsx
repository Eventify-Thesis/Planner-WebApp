import { Button } from '@mantine/core';
import {
  GenericModalProps,
  Question,
  QuestionRequestData,
  QuestionType,
} from '@/types/types.ts';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useParams } from 'react-router-dom';
import { Modal } from '../../common/Modal';
import { QuestionForm } from '../../forms/QuestionForm';
import { showError } from '@/utils/notifications.tsx';
import { useTranslation } from 'react-i18next';
import { listTicketsAPI } from '@/api/events.api';
import { TicketModel } from '@/domain/TicketModel';
import { useEffect, useState } from 'react';
import { QuestionModel } from '@/domain/QuestionModel';
import { createQuestionAPI } from '@/api/questions.api';

interface CreateQuestionModalProps extends GenericModalProps {
  onCompleted: (question: Question) => void;
  reloadQuestions: () => void;
}

export const CreateQuestionModal = ({
  onClose,
  onCompleted,
  reloadQuestions,
}: CreateQuestionModalProps) => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  //   const queryClient = useQueryClient();
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  useEffect(() => {
    const getTickets = async () => {
      const tickets = await listTicketsAPI(eventId!);
      setTickets(tickets);
    };
    getTickets();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      type: QuestionType.SINGLE_LINE_TEXT.toString(),
      required: false,
      options: [],
      ticket_ids: [],
      apply_to_all_tickets: true,
      belongs_to: 'ORDER',
      isHidden: false,
    },
  });

  //   const mutation = useMutation({
  //     mutationFn: (questionData: Question) =>
  //       questionClient.create(eventId, questionData as QuestionRequestData),

  //     onSuccess: ({ data: question }) => {
  //       notifications.show({
  //         message: t`Successfully Created Question`,
  //         color: 'green',
  //       });
  //       queryClient
  //         .invalidateQueries({ queryKey: [GET_EVENT_QUESTIONS_QUERY_KEY] })
  //         .then(() => {
  //           onCompleted(question);
  //           onClose();
  //           form.reset();
  //         });
  //     },

  //     onError: (error: any) => {
  //       if (error?.response?.data?.errors) {
  //         form.setErrors(error.response.data.errors);
  //       } else {
  //         showError(t`Unable to create question. Please check the your details`);
  //       }
  //     },
  //   });

  const createQuestion = async (questionData: QuestionModel) => {
    try {
      setIsLoading(true);
      const response = await createQuestionAPI(eventId!, questionData);
      notifications.show({
        message: t('questions.create.success'),
        color: 'green',
      });

      await reloadQuestions();

      onClose();
      setIsLoading(false);
      onCompleted(questionData);

      form.reset();

      // Call the reload function to refresh the question list

      return response;
    } catch (error) {
      showError(t('questions.create.error'));
    }
  };

  return (
    <Modal opened onClose={onClose} heading={t('questions.create.title')}>
      <form
        onSubmit={form.onSubmit((values) =>
          createQuestion(values as any as Question),
        )}
      >
        <QuestionForm form={form} tickets={tickets} />
        <Button loading={isLoading} type="submit" fullWidth mt="xl">
          {isLoading ? t('questions.create.working') : t('questions.create.title')}
        </Button>
      </form>
    </Modal>
  );
};
