export enum QuestionType {
  ADDRESS = 'ADDRESS',
  PHONE = 'PHONE',
  SINGLE_LINE_TEXT = 'SINGLE_LINE_TEXT',
  MULTI_LINE_TEXT = 'MULTI_LINE_TEXT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  DROPDOWN = 'DROPDOWN',
  MULTI_SELECT_DROPDOWN = 'MULTI_SELECT_DROPDOWN',
  DATE = 'DATE',
}

export enum QuestionBelongsTo {
  ORDER = 'ORDER',
  TICKET = 'TICKET',
}

export interface QuestionAnswer {
  questionId: number;
  title: string;
  answer: string[] | string;
  textAnswer: string;
  orderId: number;
  belongsTo: string;
  questionType: string;
  attendeeId?: number;
  firstName?: string;
  lastName?: string;
}

export interface QuestionModel {
  id?: number;
  title: string;
  type: QuestionType;
  options?: string[];
  description?: string;
  sortOrder: number;
  required: boolean;
  eventId: number;
  belongsTo: QuestionBelongsTo;
  isHidden: boolean;
  ticketTypeIds?: string[];
}
