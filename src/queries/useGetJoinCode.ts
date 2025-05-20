import { useQuery } from '@tanstack/react-query';
import { quizClient } from '@/api/quiz.client';
import { QUIZ_KEYS } from '@/queries/useQuizQueries';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';

export const useGetJoinCode = (eventId: IdParam, quizId: IdParam) => {
  return useQuery<any, AxiosError>({
    queryKey: [
      ...QUIZ_KEYS.joinCode(Number(eventId), Number(quizId)),
      'join-code',
    ],
    queryFn: async () => {
      return await quizClient.generateQuizJoinCode(
        Number(eventId),
        Number(quizId),
      );
    },
  });
};
