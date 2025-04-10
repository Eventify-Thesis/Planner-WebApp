import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { seatCategoryMappingClient } from '@/api/seatCategoryMapping.client';
import { message } from 'antd';
import { IdParam } from '@/types/types';
import { SHOW_QUERY_KEYS } from './useShowQueries';

export const SEAT_CATEGORY_MAPPING_QUERY_KEYS = {
  list: 'seatCategoryMappings',
  byShowId: 'seatCategoryMappingsByShowId',
};

export const useSeatCategoryMappingQueries = () => {
  const queryClient = useQueryClient();

  const useGetByShowId = (
    eventId: string,
    showId: string,
    enabled: boolean = true,
  ) => {
    return useQuery({
      queryKey: [SEAT_CATEGORY_MAPPING_QUERY_KEYS.byShowId, eventId, showId],
      queryFn: () => seatCategoryMappingClient.getByShowId(eventId, showId),
      enabled,
    });
  };

  const batchCreateMutation = useMutation({
    mutationFn: ({
      eventId,
      showId,
      mappings,
    }: {
      eventId: string;
      showId: string;
      mappings: any[];
    }) => seatCategoryMappingClient.batchCreate(eventId, showId, { mappings }),
    onSuccess: (_, variables) => {
      message.success('Seat category mappings created successfully');
      queryClient.invalidateQueries({
        queryKey: [
          SEAT_CATEGORY_MAPPING_QUERY_KEYS.byShowId,
          variables.eventId,
          variables.showId,
        ],
      });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create seat category mappings');
    },
  });

  const batchUpdateMutation = useMutation({
    mutationFn: ({
      eventId,
      showId,
      mappings,
    }: {
      eventId: string;
      showId: string;
      mappings: any[];
    }) => seatCategoryMappingClient.batchUpdate(eventId, showId, { mappings }),
    onSuccess: (_, variables) => {
      message.success('Seat category mappings updated successfully');
      queryClient.invalidateQueries({
        queryKey: [
          SEAT_CATEGORY_MAPPING_QUERY_KEYS.byShowId,
          variables.eventId,
          variables.showId,
        ],
      });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to update seat category mappings');
    },
  });

  const deleteByShowIdMutation = useMutation({
    mutationFn: ({ eventId, showId }: { eventId: string; showId: string }) =>
      seatCategoryMappingClient.deleteByShowId(eventId, showId),
    onSuccess: (_, variables) => {
      message.success('Seat category mappings deleted successfully');
      queryClient.invalidateQueries({
        queryKey: [
          SEAT_CATEGORY_MAPPING_QUERY_KEYS.byShowId,
          variables.eventId,
          variables.showId,
        ],
      });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to delete seat category mappings');
    },
  });

  const lockMutation = useMutation({
    mutationFn: ({
      eventId,
      showId,
      id,
      locked,
    }: {
      eventId: IdParam;
      showId: IdParam;
      id: IdParam;
      locked: boolean;
    }) => seatCategoryMappingClient.lock(eventId, showId, id, locked),
    onSuccess: (_, variables) => {
      message.success('Seat category mappings locked successfully');

      queryClient.invalidateQueries({
        queryKey: [SHOW_QUERY_KEYS.list, variables.eventId],
      });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to lock seat category mappings');
    },
  });

  return {
    useGetByShowId,
    batchCreateMutation,
    batchUpdateMutation,
    deleteByShowIdMutation,
    lockMutation,
  };
};
