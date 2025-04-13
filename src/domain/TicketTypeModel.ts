export interface TicketTypeModel {
  id?: number;
  name: string;
  price: number;
  isFree?: boolean;
  quantity: number;
  minTicketPurchase: number;
  maxTicketPurchase: number;
  startTime: Date;
  endTime: Date;
  description: string;
  imageUrl: string;
  isDisabled?: boolean;
  position: number;
}
