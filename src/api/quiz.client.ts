import { queryParamsHelper } from '@/utils/queryParamsHelper';
import { httpApi } from './http.api';
import { IdParam, QueryFilters } from '@/types/types';

export interface QuizModel {
  id: number;
  showId: number;
  eventId: number;
  title: string;
  isCompleted: boolean;
  passingScore: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestionModel {
  id: number;
  quizId: number;
  text: string;
  correctOption: number;
  timeLimit: number | null;
  explanation?: string;
  createdAt: string;
  options: { id: number; text: string }[];
}

export interface CreateQuizDto {
  title: string;
}

export interface UpdateQuizDto {
  title?: string;
}

export interface CreateQuizQuestionDto {
  text: string;
  quizId: number;
  eventId: number;
  showId: number;
  options: { id: number; text: string }[];
  correctOption: number;
  explanation?: string;
  timeLimit?: number;
}

export interface UpdateQuizQuestionDto {
  text?: string;
  options?: { id: number; text: string }[];
  correctOption?: number;
  explanation?: string;
  timeLimit?: number;
}

export interface QuizResultModel {
  id: number;
  quizId: number;
  userId: string;
  eventId: number;
  showId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  isPassed: boolean;
  completedAt: string;
}

export interface QuizJoinCodeResponse {
  code: string;
  expiresAt: string;
}

export const quizClient = {
  // Quiz operations
  getQuizzes: async (
    eventId: IdParam,
    filters: QueryFilters,
  ): Promise<QuizModel[]> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/quizzes` +
          queryParamsHelper.buildQueryString(filters),
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getQuizById: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<QuizModel> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/quizzes/${quizId}`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  createQuiz: async (
    eventId: IdParam,
    showId: IdParam,
    quizData: CreateQuizDto,
  ): Promise<QuizModel> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/quizzes/shows/${showId}`,
        quizData,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  updateQuiz: async (
    eventId: IdParam,
    quizId: IdParam,
    quizData: UpdateQuizDto,
  ): Promise<QuizModel> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}/quizzes/${quizId}`,
        quizData,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  deleteQuiz: async (eventId: IdParam, quizId: IdParam): Promise<void> => {
    try {
      await httpApi.delete<any>(`/planner/events/${eventId}/quizzes/${quizId}`);
    } catch (e: any) {
      throw new Error(e);
    }
  },

  activateQuiz: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<QuizModel> => {
    try {
      const response = await httpApi.patch<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/activate`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  deactivateQuiz: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<QuizModel> => {
    try {
      const response = await httpApi.patch<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/deactivate`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // Quiz Questions operations
  getQuizQuestions: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<QuizQuestionModel[]> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/questions`,
      );
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  createQuizQuestion: async (
    eventId: IdParam,
    quizId: IdParam,
    questionData: CreateQuizQuestionDto,
  ): Promise<QuizQuestionModel> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/questions`,
        questionData,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  updateQuizQuestion: async (
    eventId: IdParam,
    quizId: IdParam,
    questionId: IdParam,
    questionData: UpdateQuizQuestionDto,
  ): Promise<QuizQuestionModel> => {
    try {
      const response = await httpApi.put<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/questions/${questionId}`,
        questionData,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  deleteQuizQuestion: async (
    eventId: IdParam,
    quizId: IdParam,
    questionId: IdParam,
  ): Promise<void> => {
    try {
      await httpApi.delete<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/questions/${questionId}`,
      );
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // Quiz Results operations
  getQuizResults: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<QuizResultModel[]> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/results`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getQuizAnalytics: async (eventId: IdParam, quizId: IdParam): Promise<any> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/analytics`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // Generate QR code for quiz
  generateQuizJoinLink: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<{ joinUrl: string; qrCode: string }> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/join-link`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // Generate a 6-digit join code for quiz
  generateQuizJoinCode: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<QuizJoinCodeResponse> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/join-code`,
      );
      return response.data.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // Verify a join code
  verifyQuizJoinCode: async (
    code: string,
  ): Promise<{ valid: boolean; quizId?: number }> => {
    try {
      const response = await httpApi.get<any>(
        `/planner/quizzes/verify-code/${code}`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // Start next question
  startNextQuestion: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<{ success: boolean; currentQuestion: number }> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/next-question`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // Generate questions for a quiz
  generateQuizQuestions: async (
    eventId: IdParam,
    quizId: IdParam,
    options?: { topic: string; difficulty?: string; count?: number },
  ): Promise<any> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/generate`,
        options,
      );
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // Start the quiz
  startQuiz: async (
    eventId: IdParam,
    quizId: IdParam,
  ): Promise<{ success: boolean }> => {
    try {
      const response = await httpApi.post<any>(
        `/planner/events/${eventId}/quizzes/${quizId}/start`,
      );
      return response.data;
    } catch (e: any) {
      throw new Error(e);
    }
  },
};
