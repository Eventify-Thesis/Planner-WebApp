import { useQuery } from '@tanstack/react-query';
import { quizClient, QuizModel, QuizQuestionModel, QuizResultModel } from '@/api/quiz.client';
import { AxiosError } from 'axios';
import { IdParam, QueryFilters } from '@/types/types';

// Query keys
export const QUIZ_KEYS = {
  all: ['quizzes'] as const,
  lists: () => [...QUIZ_KEYS.all, 'list'] as const,
  list: (showId: number) => [...QUIZ_KEYS.lists(), showId] as const,
  details: () => [...QUIZ_KEYS.all, 'detail'] as const,
  detail: (showId: number, quizId: number) => [...QUIZ_KEYS.details(), showId, quizId] as const,
  questions: (showId: number, quizId: number) => [...QUIZ_KEYS.detail(showId, quizId), 'questions'] as const,
  results: (showId: number, quizId: number) => [...QUIZ_KEYS.detail(showId, quizId), 'results'] as const,
  analytics: (showId: number, quizId: number) => [...QUIZ_KEYS.detail(showId, quizId), 'analytics'] as const,
};

// Get all quizzes for a show
export const useGetQuizzes = (eventId: IdParam, filters: QueryFilters) => {
  return useQuery<QuizModel[], AxiosError>({
    queryKey: QUIZ_KEYS.list(Number(filters.showId)),
    queryFn: async () => {
      return await quizClient.getQuizzes(eventId, filters);
    },
    enabled: !!eventId && !!filters.showId,
  });
};

// Get a specific quiz by ID
export const useGetQuizById = (eventId: string | number, quizId: string | number) => {
  return useQuery<QuizModel, AxiosError>({
    queryKey: QUIZ_KEYS.detail(Number(eventId), Number(quizId)),
    queryFn: async () => {
      return await quizClient.getQuizById(eventId, quizId);
    },
    enabled: !!eventId && !!quizId,
  });
};

// Get questions for a quiz
export const useGetQuizQuestions = (eventId: string | number, quizId: string | number) => {
  return useQuery<QuizQuestionModel[], AxiosError>({
    queryKey: QUIZ_KEYS.questions(Number(eventId), Number(quizId)),
    queryFn: async () => {
      const data = await quizClient.getQuizQuestions(eventId, quizId);
      console.log(data);
      return data;
    },
    enabled: !!eventId && !!quizId,
  });
};

// Get results for a quiz
export const useGetQuizResults = (eventId: string | number, quizId: string | number) => {
  return useQuery<QuizResultModel[], AxiosError>({
    queryKey: QUIZ_KEYS.results(Number(eventId), Number(quizId)),
    queryFn: async () => {
      return await quizClient.getQuizResults(eventId, quizId);
    },
    enabled: !!eventId && !!quizId,
  });
};

// Get analytics for a quiz
export const useGetQuizAnalytics = (eventId: string | number, quizId: string | number) => {
  return useQuery<any, AxiosError>({
    queryKey: QUIZ_KEYS.analytics(Number(eventId), Number(quizId)),
    queryFn: async () => {
      return await quizClient.getQuizAnalytics(eventId, quizId);
    },
    enabled: !!eventId && !!quizId,
  });
};

// Generate questions for a quiz
export const useGenerateQuizQuestions = (eventId: string | number, quizId: string | number) => {
  return useQuery<any, AxiosError>({
    queryKey: [...QUIZ_KEYS.detail(Number(eventId), Number(quizId)), 'generate'],
    queryFn: async () => {
      return await quizClient.generateQuizQuestions(eventId, quizId);
    },
    enabled: false, // This query should be manually triggered
  });
};
