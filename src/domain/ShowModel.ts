export interface ShowingModel {
  tickets: TicketModel[];
  startTime: Date;
  endTime: Date;
}

export interface ShowModel {
  id?: string;
  eventId: string;
  showings: ShowingModel[];
}
