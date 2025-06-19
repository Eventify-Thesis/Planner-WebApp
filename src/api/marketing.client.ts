import { IdParam } from '@/types/types';
import { httpApi } from './http.api';

export interface GeneratePostResponse {
  result: string;
}

export interface GeneratePostDto {
  eventId: string;
  data: {
    eventName: string;
    eventDescription: string;
    eventType: string;
    orgName: string;
    orgDescription?: string;
    orgLogoUrl?: string;
    eventLogoUrl?: string;
    eventBannerUrl?: string;
    venueName?: string;
    street?: string;
    categories?: string[];
    date: string;
  };
}

export interface SchedulePostDto {
  eventId: string;
  data: {
    pageId: string;
    content: string;
    scheduledTime: string;
    accessToken: string;
  };
}

export interface GeneratePostData {
  eventName: string;
  eventDescription: string;
  eventType: string;
  orgName: string;
  orgDescription?: string;
  orgLogoUrl?: string;
  eventLogoUrl?: string;
  eventBannerUrl?: string;
  venueName?: string;
  street?: string;
  categories?: string[];
  date: string;
  customPrompt?: string;
}

export interface GeneratePostVariables {
  eventId: string;
  data: GeneratePostData;
}

export interface SchedulePostData {
  pageId: string;
  content: string;
  scheduledTime: string;
  imageUrls: string[];
}

export interface SchedulePostVariables {
  eventId: string;
  data: SchedulePostData;
}

export interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
}

export interface FacebookPostsResponse {
  result: {
    id: string;
    message: string;
    imageUrls: string[];
    scheduledAt: string;
    likes: number;
    comments: number;
    shares: number;
  }[];
}

export const marketingClient = {
  generatePost: async (eventId: IdParam, data: GeneratePostDto) => {
    const response = await httpApi.post<any>(
      `/planner/events/${eventId}/marketing/generate`,
      data,
    );
    return response.data;
  },

  getFacebookPages: async (eventId: IdParam) => {
    const response = await httpApi.get<FacebookPage[]>(
      `/planner/events/${eventId}/marketing/facebook/pages`,
    );
    return response.data;
  },

  schedulePost: async (eventId: IdParam, data: SchedulePostDto) => {
    return await httpApi.post<any>(
      `/planner/events/${eventId}/marketing/facebook/schedule`,
      data,
    );
  },

  getFacebookPosts: async (eventId: IdParam, pageId: string) => {
    const response = await httpApi.get<FacebookPostsResponse>(
      `/planner/events/${eventId}/marketing/facebook/posts`,
      {
        params: { pageId },
      },
    );
    return response.data;
  },

  checkFacebookAuth(userId: string) {
    const response = httpApi.get<{ isAuthenticated: boolean }>(
      `/auth/facebook/check`,
      {
        params: { userId },
      },
    );
    return response;
  },

  disconnectFacebook(userId: string) {
    const response = httpApi.post<{ success: boolean }>(
      `/auth/facebook/disconnect`,
      null,
      {
        params: { userId },
      },
    );
    return response;
  },
};
