import { TicketTypeModel } from './TicketTypeModel';

export interface ShowModel {
  id?: string;
  eventId: string;
  ticketTypes: TicketTypeModel[];
  startTime: Date;
  endTime: Date;
}
