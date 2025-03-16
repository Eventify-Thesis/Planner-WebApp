import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { questionClient, QuestionsResponse } from '@/api/question.client';
import { QuestionModel } from '@/domain/QuestionModel';
import { IdParam } from '@/types/types';

export const QUESTION_QUERY_KEYS = {
  list: 'questionList',
  detail: 'questionDetail',
};

export const useListQuestions = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return {
    ...useQuery<QuestionsResponse, AxiosError>({
      queryKey: [QUESTION_QUERY_KEYS.list, eventId],
      queryFn: async () => {
        return await questionClient.list(eventId);
      },
    }),
    refetch: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QUESTION_QUERY_KEYS.list, eventId],
      });
    },
  };
};

export const useGetQuestion = (eventId: string, questionId: string) => {
  return useQuery<QuestionModel, AxiosError>({
    queryKey: [QUESTION_QUERY_KEYS.detail, eventId, questionId],
    queryFn: async () => {
      return await questionClient.get(eventId, questionId);
    },
  });
};

export const useQuestionMutations = (eventId: string) => {
  const queryClient = useQueryClient();

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionModel) => {
      return await questionClient.create(eventId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUESTION_QUERY_KEYS.list, eventId],
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({
      questionId,
      data,
    }: {
      questionId: string;
      data: QuestionModel;
    }) => {
      return await questionClient.update(eventId, questionId, data);
    },
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: [QUESTION_QUERY_KEYS.list, eventId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUESTION_QUERY_KEYS.detail, eventId, questionId],
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: IdParam) => {
      return await questionClient.delete(eventId, questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUESTION_QUERY_KEYS.list, eventId],
      });
    },
  });

  const sortQuestionsMutation = useMutation({
    mutationFn: async (sortedQuestionIds: { id: IdParam; order: number }[]) => {
      console.log(sortedQuestionIds);
      return await questionClient.sort(eventId, sortedQuestionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUESTION_QUERY_KEYS.list, eventId],
      });
    },
  });

  return {
    createQuestionMutation,
    updateQuestionMutation,
    deleteQuestionMutation,
    sortQuestionsMutation,
  };
};
