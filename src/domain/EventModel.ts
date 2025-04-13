import { EventType, EventStatus } from '@/constants/enums/event';

export interface EventModel {
  id?: number;
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
  orgLogoUrl?: string;
  eventLogoUrl?: string;
  eventBannerUrl?: string;
  venueName?: string;
  cityId?: number;
  districtId?: number;
  wardId?: number;
  street?: string;
  categoriesIds?: string[];
  categories?: string[];
}
