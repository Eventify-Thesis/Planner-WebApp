export interface Position {
  x: number;
  y: number;
}

export interface Category {
  name: string;
  color: string;
}

export interface Seat {
  uuid: string;
  seat_number: string;
  seat_guid: string;
  position: Position;
  category: string;
  radius?: number;
}

export interface Row {
  uuid: string;
  row_number: string;
  row_number_position: 'left' | 'right' | 'both';
  position: Position;
  seats: Seat[];
}

export interface Area {
  uuid: string;
  shape: 'rectangle' | 'ellipse';
  color: string;
  border_color: string;
  rotation: number;
  position: Position;
  text: {
    position: Position;
    color: string;
    text: string;
  };
}

export interface Zone {
  uuid: string;
  name: string;
  zone_id: string;
  position: Position;
  rows: Row[];
  areas: Area[];
}

export interface SeatingPlan {
  id: string;
  name: string;
  categories: Category[];
  zones: Zone[];
  size: {
    width: number;
    height: number;
  };
  backgroundImage?: string;
}

export enum EditorTool {
  SELECT = 'select',
  SELECT_ROW = 'select_row',
  ADD_ROW = 'add_row',
  ADD_SHAPE = 'add_shape',
  ADD_TEXT = 'add_text',
  MOVE = 'move',
}
