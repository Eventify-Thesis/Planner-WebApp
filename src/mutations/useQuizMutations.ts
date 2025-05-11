import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quizClient, CreateQuizDto, UpdateQuizDto, CreateQuizQuestionDto, UpdateQuizQuestionDto } from '@/api/quiz.client';
import { QUIZ_KEYS } from '@/queries/useQuizQueries';
import { IdParam } from '@/types/types';

// Create a new quiz
export const useCreateQuiz = (eventId: IdParam, showId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizData: CreateQuizDto) => {
      return await quizClient.createQuiz(eventId, showId, quizData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.list(Number(showId)) });
    },
  });
};

// Update a quiz
export const useUpdateQuiz = (eventId: IdParam, quizId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizData: UpdateQuizDto) => {
      return await quizClient.updateQuiz(eventId, quizId, quizData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.detail(Number(eventId), Number(quizId)) });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.list(Number(quizId)) });
    },
  });
};

// Delete a quiz
export const useDeleteQuiz = (eventId: IdParam, showId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: IdParam) => {
      return await quizClient.deleteQuiz(eventId, quizId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.list(Number(showId)) });
    },
  });
};

// Activate a quiz
export const useActivateQuiz = (eventId: IdParam, quizId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await quizClient.activateQuiz(eventId, quizId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.detail(Number(eventId), Number(quizId)) });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.list(Number(quizId)) });
    },
  });
};

// Deactivate a quiz
export const useDeactivateQuiz = (eventId: IdParam, quizId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await quizClient.deactivateQuiz(eventId, quizId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.detail(Number(eventId), Number(quizId)) });
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.list(Number(quizId)) });
    },
  });
};

// Create a quiz question
export const useCreateQuizQuestion = (eventId: IdParam, quizId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionData: CreateQuizQuestionDto) => {
      return await quizClient.createQuizQuestion(eventId, quizId, questionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.questions(Number(eventId), Number(quizId)) });
    },
  });
};

// Update a quiz question
export const useUpdateQuizQuestion = (eventId: IdParam, quizId: IdParam, questionId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionData: UpdateQuizQuestionDto) => {
      return await quizClient.updateQuizQuestion(eventId, quizId, questionId, questionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.questions(Number(eventId), Number(quizId)) });
    },
  });
};

// Delete a quiz question
export const useDeleteQuizQuestion = (eventId: IdParam, quizId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: IdParam) => {
      return await quizClient.deleteQuizQuestion(eventId, quizId, questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.questions(Number(eventId), Number(quizId)) });
    },
  });
};

// Generate join link/QR code for a quiz
export const useGenerateQuizJoinLink = (eventId: IdParam, quizId: IdParam) => {
  return useMutation({
    mutationFn: async () => {
      return await quizClient.generateQuizJoinLink(eventId, quizId);
    },
  });
};

// Start next question in a quiz
export const useStartNextQuestion = (eventId: IdParam, quizId: IdParam) => {
  return useMutation({
    mutationFn: async () => {
      return await quizClient.startNextQuestion(eventId, quizId);
    },
  });
};

// Generate questions for a quiz
export const useGenerateQuizQuestions = (eventId: IdParam, quizId: IdParam) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: { topic: string; difficulty?: string; count?: number }) => {
      return await quizClient.generateQuizQuestions(eventId, quizId, options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUIZ_KEYS.questions(Number(eventId), Number(quizId)) });
    },
  });
};
