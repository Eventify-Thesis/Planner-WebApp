import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { showClient, ShowResponse } from '@/api/show.client';
import { ShowingModel } from '@/domain/ShowModel';
import { IdParam } from '@/types/types';

export const SHOW_QUERY_KEYS = {
  list: 'showList',
  detail: 'showDetail',
};

export const useListShows = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  return {
    ...useQuery<ShowResponse, AxiosError>({
      queryKey: [SHOW_QUERY_KEYS.list, eventId],
      queryFn: async () => {
        return await showClient.list(eventId);
      },
    }),
    refetch: async () => {
      await queryClient.invalidateQueries({
        queryKey: [SHOW_QUERY_KEYS.list, eventId],
      });
    },
  };
};

export const useShowMutations = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  const createShowMutation = useMutation({
    mutationFn: async (data: ShowingModel) => {
      return await showClient.create(eventId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SHOW_QUERY_KEYS.list, eventId],
      });
    },
  });

  const updateShowMutation = useMutation({
    mutationFn: async ({
      showId,
      data,
    }: {
      showId: IdParam;
      data: ShowingModel;
    }) => {
      return await showClient.update(eventId, showId, data);
    },
    onSuccess: (_, { showId }) => {
      queryClient.invalidateQueries({
        queryKey: [SHOW_QUERY_KEYS.list, eventId],
      });
      queryClient.invalidateQueries({
        queryKey: [SHOW_QUERY_KEYS.detail, eventId, showId],
      });
    },
  });

  const deleteShowMutation = useMutation({
    mutationFn: async (showId: IdParam) => {
      return await showClient.delete(eventId, showId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SHOW_QUERY_KEYS.list, eventId],
      });
    },
  });

  return {
    createShowMutation,
    updateShowMutation,
    deleteShowMutation,
  };
};
