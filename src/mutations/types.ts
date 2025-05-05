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
}

export interface GeneratePostVariables {
  eventId: string;
  data: GeneratePostData;
}

export interface SchedulePostData {
  pageId: string;
  content: string;
  scheduledTime: string;
  accessToken: string;
}

export interface SchedulePostVariables {
  eventId: string;
  data: SchedulePostData;
}
