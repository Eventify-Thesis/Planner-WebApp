import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsClient } from '@/api/event.client';
import { AxiosError } from 'axios';
import { IdParam } from '@/types/types';
import { GET_EVENT_BRIEF_QUERY_KEY } from '@/queries/useGetEventBrief';

export const useEventInfoDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await eventsClient.createDraft(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GET_EVENT_BRIEF_QUERY_KEY] });
    },
  });
};

export const useUpdateEventShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      showData,
    }: {
      eventId: IdParam;
      showData: any;
    }) => {
      return await eventsClient.updateShow(eventId, showData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GET_EVENT_BRIEF_QUERY_KEY, variables.eventId],
      });
    },
  });
};

export const useUpdateEventSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      settingData,
    }: {
      eventId: IdParam;
      settingData: any;
    }) => {
      return await eventsClient.updateSetting(eventId, settingData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GET_EVENT_BRIEF_QUERY_KEY, variables.eventId],
      });
    },
  });
};

export const useUpdateEventPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      paymentData,
    }: {
      eventId: IdParam;
      paymentData: any;
    }) => {
      return await eventsClient.updatePayment(eventId, paymentData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GET_EVENT_BRIEF_QUERY_KEY, variables.eventId],
      });
    },
  });
};
