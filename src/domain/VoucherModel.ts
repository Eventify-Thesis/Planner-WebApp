export enum VoucherCodeType {
  SINGLE = 1,
  BULK = 2,
}

export enum VoucherDiscountType {
  PERCENT = 1,
  FIXED = 2,
}

export enum VoucherStatus {
  ACTIVE = 1,
  INACTIVE = 2,
  EXPIRED = 3,
  DELETED = 4,
}

export interface ShowingVoucherDto {
  id: string;
  isAllTickets: boolean;
  ticketIds: string[];
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
