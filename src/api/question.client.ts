import { QuestionModel } from '@/domain/QuestionModel';
import { httpApi } from './http.api';
import { IdParam } from '@/types/types';

export interface QuestionsResponse {
  data: QuestionModel[];
}

export const questionClient = {
  list: async (eventId: IdParam): Promise<QuestionsResponse> => {
    const response = await httpApi.get(`planner/events/${eventId}/questions`);
    return response.data.data.result;
  },

  get: async (
    eventId: IdParam,
    questionId: IdParam,
  ): Promise<QuestionModel> => {
    const response = await httpApi.get(
      `planner/events/${eventId}/questions/${questionId}`,
    );
    return response.data.data;
  },

  create: async (
    eventId: IdParam,
    data: QuestionModel,
  ): Promise<QuestionModel> => {
    const response = await httpApi.post(
      `planner/events/${eventId}/questions`,
      data,
    );
    return response.data.data;
  },

  update: async (
    eventId: IdParam,
    questionId: IdParam,
    data: QuestionModel,
  ): Promise<QuestionModel> => {
    const response = await httpApi.patch(
      `planner/events/${eventId}/questions/${questionId}`,
      data,
    );
    return response.data.result;
  },

  delete: async (eventId: IdParam, questionId: IdParam): Promise<void> => {
    await httpApi.delete(`planner/events/${eventId}/questions/${questionId}`);
  },

  sort: async (
    eventId: IdParam,
    sortedQuestionIds: { id: IdParam; order: number }[],
  ): Promise<void> => {
    await httpApi.post(`planner/events/${eventId}/questions/sort`, {
      sortedQuestionIds,
    });
  },
};
