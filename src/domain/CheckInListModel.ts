import { IdParam } from '@/types/types';
import { ShowModel } from '../../../test-user/src/domain/ShowModel';
import { EventModel } from './EventModel';

export default interface CheckInListModel {
  id?: number;
  shortId: string;
  name: string;
  description?: string | null;
  expiresAt?: string; // ISO 8601 string
  activatesAt?: string; // ISO 8601 string
  totalAttendees: number;
  checkedInAttendees: number;
  isExpired: boolean;
  isActive: boolean;
  eventId: number;
  event?: EventModel;
  showId: number;
  show?: ShowModel;
  ticketTypes: {
    id: number;
    name: string;
  }[];
}

export type CheckInListRequest = Omit<
  CheckInListModel,
  | 'eventId'
  | 'shortId'
  | 'id'
  | 'ticketTypes'
  | 'totalAttendees'
  | 'checkedInAttendees'
  | 'isExpired'
  | 'isActive'
> & {
  ticketTypeIds: IdParam[];
};