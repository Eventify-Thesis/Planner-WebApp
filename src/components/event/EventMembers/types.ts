import { EventRole } from '@/constants/enums/event';

export type EventPermission =
  | 'org:event:analytic'
  | 'org:event:entry'
  | 'org:event:marketing'
  | 'org:event:member'
  | 'org:event:order'
  | 'org:event:seatmap'
  | 'org:event:setting'
  | 'org:event:voucher';

export const EVENT_ROLE_PERMISSIONS: Record<EventRole, EventPermission[]> = {
  OWNER: [
    'org:event:analytic',
    'org:event:entry',
    'org:event:marketing',
    'org:event:member',
    'org:event:order',
    'org:event:seatmap',
    'org:event:setting',
    'org:event:voucher',
  ],
  MANAGER: [
    'org:event:entry',
    'org:event:member',
    'org:event:order',
    'org:event:seatmap',
  ],
  ADMIN: [
    'org:event:analytic',
    'org:event:entry',
    'org:event:marketing',
    'org:event:member',
    'org:event:order',
    'org:event:seatmap',
    'org:event:setting',
    'org:event:voucher',
  ],
  ENTRY_STAFF: ['org:event:entry'],
  VENDOR: ['org:event:entry', 'org:event:order'],
};

export const EVENT_PERMISSION_LABELS: Record<EventPermission, string> = {
  'org:event:analytic': 'Event Analytics Dashboard',
  'org:event:entry': 'Event Checkin/Checkout',
  'org:event:marketing': 'Event Marketing',
  'org:event:member': 'Event Member',
  'org:event:order': 'Event Order',
  'org:event:seatmap': 'Event Seatmap',
  'org:event:setting': 'Event Setting',
  'org:event:voucher': 'Event Voucher',
};

export const EVENT_ROLE_LABELS: Record<EventRole, string> = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  ENTRY_STAFF: 'ENTRY_STAFF',
  VENDOR: 'VENDOR',
};
