import { AgeRestriction } from '@/constants/enums/event';

export interface SettingModel {
  id?: string;
  eventId?: string;
  url?: string;
  messageAttendees?: string;
  isPrivate?: boolean;
  isEnableQuestionForm?: boolean;
  maximumAttendees?: number;
  ageRestriction?: AgeRestriction;
}
