import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFilters,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { MemberModel } from '@/domain/MemberModel';
import { EventRole } from '@/constants/enums/event';
import { memberClient } from '@/api/member.client';
import { IdParam } from '@/types/types';

export const MEMBER_QUERY_KEYS = {
  list: 'memberList',
};

export const useListMembers = (eventId: IdParam, pagination: QueryFilters) => {
  return useQuery<
    { docs: MemberModel[]; totalDocs: number; totalPages: number },
    AxiosError
  >({
    queryKey: [MEMBER_QUERY_KEYS.list, eventId, pagination],
    queryFn: async () => {
      return await memberClient.list(eventId, pagination);
    },
  });
};

export const useMemberMutations = (eventId: IdParam) => {
  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      role: EventRole;
      organizationId: string;
    }) => {
      return await memberClient.add(eventId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MEMBER_QUERY_KEYS.list, eventId],
      });
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: IdParam;
      data: { role: EventRole };
    }) => {
      return await memberClient.updateRole(eventId, userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MEMBER_QUERY_KEYS.list, eventId],
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (userId: IdParam) => {
      return await memberClient.delete(eventId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MEMBER_QUERY_KEYS.list, eventId],
      });
    },
  });

  return {
    addMemberMutation,
    updateMemberRoleMutation,
    deleteMemberMutation,
  };
};
