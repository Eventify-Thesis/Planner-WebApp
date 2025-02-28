import { EventType, EventStatus } from '@/constants/enums/event';

export interface EventModel {
  id?: string;
  _id?: string;
  paymentInfo?: string;
  setting?: string;
  show?: string;
  organizationId?: string;
  eventName?: string;
  eventDescription?: string;
  eventType?: EventType;
  status?: EventStatus;
  orgName?: string;
  orgDescription?: string;
  orgLogoURL?: string;
  eventLogoURL?: string;
  eventBannerURL?: string;
  venueName?: string;
  cityId?: number;
  districtId?: number;
  wardId?: number;
  street?: string;
  categoriesIds?: string[];
  categories?: string[];
}
