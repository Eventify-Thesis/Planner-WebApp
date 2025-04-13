import { BusinessType } from '@/constants/enums/event';

export interface PaymentInfoModel {
  id?: number;
  eventId?: number;
  bankAccount?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankOffice?: string;
  businessType?: BusinessType;
  name?: string;
  address?: string;
  taxNumber?: string;
}
