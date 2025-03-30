import { BaseModel } from './BaseModel';
import { SeatingPlanModel } from './SeatingPlanModel';
import { TicketTypeModel } from './TicketTypeModel';

export interface ShowModel extends BaseModel {
  id?: string;
  eventId: string;
  name: string;
  description?: string;
  ticketTypes: TicketTypeModel[];
  startTime: string;
  endTime: string;
  seatingPlanId?: string;
  seatingPlan?: SeatingPlanModel;
}
