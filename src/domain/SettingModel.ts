import { AgeRestriction } from '@/constants/enums/event';

export interface SettingModel {
  id?: number;
  eventId?: number;
  url?: string;
  messageAttendees?: string;
  isPrivate?: boolean;
  isEnableQuestionForm?: boolean;
  maximumAttendees?: number;
  ageRestriction?: AgeRestriction;
}
