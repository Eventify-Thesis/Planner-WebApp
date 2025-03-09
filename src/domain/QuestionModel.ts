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

export interface QuestionModel {
  id: string;
  title: string;
  type: QuestionType;
  options?: string[];
  description?: string;
  sortOrder: number;
  required: boolean;
  eventId: string;
  belongsTo: QuestionBelongsTo;
  isHidden: boolean;
  ticketIds?: string[];
}
