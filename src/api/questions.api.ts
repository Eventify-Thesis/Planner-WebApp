import { httpApi } from '@/api/http.api';
import { QuestionModel } from '@/domain/QuestionModel';
import { QuestionRequestData } from '@/types/types';

export const listQuestionsAPI = async (
  eventId: string,
): Promise<QuestionModel[]> => {
  const response = await httpApi.get<any>(
    `/planner/events/${eventId}/questions`,
  );
  return response.data.data.result;
};

export const createQuestionAPI = async (
  eventId: string,
  questionData: QuestionModel,
): Promise<QuestionModel> => {
  const response = await httpApi.post<any>(
    `/planner/events/${eventId}/questions`,
    questionData,
  );
  return response.data.data.result;
};

export const updateQuestionAPI = async (
  eventId: string,
  questionId: string,
  questionData: QuestionRequestData,
): Promise<QuestionModel> => {
  const response = await httpApi.patch<any>(
    `/planner/events/${eventId}/questions/${questionId}`,
    questionData,
  );
  return response.data.data.result;
};

export const getQuestionAPI = async (
  eventId: string,
  questionId: string,
): Promise<QuestionModel> => {
  const response = await httpApi.get<any>(
    `/planner/events/${eventId}/questions/${questionId}`,
  );
  return response.data.data;
};

export const deleteQuestionAPI = async (
  eventId: string,
  questionId: string,
): Promise<void> => {
  await httpApi.delete<any>(
    `/planner/events/${eventId}/questions/${questionId}`,
  );
};

export const sortQuestionAPI = async (
  eventId: string,
  sortedQuestionIds: { id: string; order: number }[],
): Promise<void> => {
  await httpApi.post<any>(
    `/planner/events/${eventId}/questions/sort`,
    sortedQuestionIds,
  );
};
