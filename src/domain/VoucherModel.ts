export enum VoucherCodeType {
  SINGLE = 'SINGLE',
  BULK = 'BULK',
}

export enum VoucherDiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export enum VoucherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export interface ShowingVoucherDto {
  id: string;
  isAllTicketTypes: boolean;
  ticketTypeIds: string[];
}

export interface CreateVoucherDto {
  name: string;
  active?: boolean;
  codeType: VoucherCodeType;
  bulkCodePrefix?: string;
  bulkCodeNumber?: number;
  discountType: VoucherDiscountType;
  discountValue: number;
  quantity: number;
  isUnlimited: boolean;
  maxOrderPerUser: number;
  minQtyPerOrder: number;
  maxQtyPerOrder: number;
  discountCode: string;
  showings: ShowingVoucherDto[];
  isAllShowings: boolean;
  source: number;
  status?: VoucherStatus;
  startTime: Date;
  endTime: Date;
}

export interface UpdateVoucherDto extends Partial<CreateVoucherDto> {
  active?: boolean;
  status?: VoucherStatus;
}

export interface VoucherModel extends CreateVoucherDto {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
