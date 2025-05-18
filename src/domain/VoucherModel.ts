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
  id: number;
  isAllTicketTypes: boolean;
  ticketTypeIds: number[];
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
  showingConfigs: ShowingVoucherDto[];
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
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
