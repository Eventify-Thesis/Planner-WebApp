import { BusinessType } from '@/constants/enums/event';

export interface PaymentInfoModel {
  id?: string;
  eventId?: string;
  bankAccount?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankOffice?: string;
  businessType?: BusinessType;
  companyName?: string;
  companyAddress?: string;
  taxNumber?: string;
}
