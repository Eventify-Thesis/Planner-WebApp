export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Category {
  name: string;
  color: string;
  seatCount: number;
}

export interface Seat {
  uuid: string;
  position: Point;
  number: number;
  category?: string;
  radius: number;
  label?: string;
  rowId: string; // Reference to parent row
}

export interface Row {
  uuid: string;
  position: Point;
  rowNumber: number;
  label?: string;
  seatSpacing: number;
  seatRadius: number;
  defaultCategory?: string;
  seats: Seat[];
  type: 'straight' | 'circular' | 'rectangular';
  startNumber: number;
  numberingType: 'continuous' | 'perRow';
  numberFormat: string;
}

export interface Shape {
  uuid: string;
  type: 'rectangle' | 'circle' | 'ellipse' | 'polygon';
  position: Point;
  size?: Size; // For rectangle and ellipse
  radius?: number; // For circle
  points?: Point[]; // For polygon
  fill?: string;
  stroke?: string;
}

export interface TextLabel {
  uuid: string;
  position: Point;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
}

export interface Zone {
  uuid: string;
  name: string;
  areas: Shape[];
  rows: Row[];
}

export interface Selection {
  type: 'none' | 'seat' | 'row' | 'shape';
  ids: string[];
}

export interface SeatingPlan {
  uuid: string;
  name: string;
  size: {
    width: number;
    height: number;
  };
  backgroundImage?: string;
  categories: Category[];
  zones: Zone[];
  totalSeats: number;
}

export enum EditorTool {
  SELECT = 'SELECT',
  SELECT_ROW = 'SELECT_ROW',
  ADD_SHAPE = 'ADD_SHAPE',
  ADD_CIRCLE = 'ADD_CIRCLE',
  ADD_ELLIPSE = 'ADD_ELLIPSE',
  ADD_TEXT = 'ADD_TEXT',
  ADD_ROW = 'ADD_ROW',
  ADD_RECT_ROW = 'ADD_RECT_ROW',
  ADD_CIRCULAR_ROW = 'ADD_CIRCULAR_ROW',
  NONE = 'NONE',
  MOVE = 'move',
}
