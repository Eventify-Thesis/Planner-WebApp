export interface TicketModel {
  id?: string;
  name: string;
  price: number;
  isFree?: boolean;
  quantity: number;
  minTicketPurchase: number;
  maxTicketPurchase: number;
  startTime: Date;
  endTime: Date;
  description: string;
  imageURL: string;
  isDisabled?: boolean;
  position: number;
}
