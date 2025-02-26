import { EventStatus } from '@/constants/enums/event';

export interface EventListAllResponse {
  id: string;

  addressFull: string;

  eventBannerURL: string;

  eventName: string;

  url: string;

  startTime: Date;

  endTime: string;

  status: EventStatus;

  venueName: string;

  role: string;
}
