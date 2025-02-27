export interface TicketTypeModel {
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

export interface ShowingModel {
  ticketTypes: TicketTypeModel[];
  startTime: Date;
  endTime: Date;
}

export interface ShowModel {
  id?: string;
  eventId: string;
  showings: ShowingModel[];
}
