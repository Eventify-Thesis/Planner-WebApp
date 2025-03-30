import { TicketTypeModel } from './TicketTypeModel';

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
