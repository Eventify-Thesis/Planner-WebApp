import { SeatingPlanModel } from './SeatingPlanModel';
import { TicketTypeModel } from './TicketTypeModel';

export interface ShowModel {
  id?: string;
  eventId: string;
  name: string;
  description?: string;
  ticketTypes: TicketTypeModel[];
  startTime: string;
  endTime: string;
  seatingPlanId?: string;
  seatingPlan?: SeatingPlanModel;
  locked?: boolean;
}
