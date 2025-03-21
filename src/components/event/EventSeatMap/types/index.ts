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
}

export interface Seat {
  uuid: string;
  position: Point;
  category?: string;
}

export interface Row {
  uuid: string;
  seats: Seat[];
  type: 'circular' | 'straight' | 'rectangular';
  position: Point;
  size?: Size; // For rectangular rows
  angle?: number; // For circular/straight rows
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
  zone_id: string;
  position: Point;
  rows: Row[];
  areas: (Shape | TextLabel)[];
}

export interface SeatingPlan {
  id: string;
  name: string;
  size: Size;
  categories: Category[];
  zones: Zone[];
  backgroundImage?: string;
}

export enum EditorTool {
  SELECT = 'select',
  SELECT_ROW = 'select_row',
  ADD_ROW = 'add_row',
  ADD_RECT_ROW = 'add_rect_row',
  ADD_SHAPE = 'add_shape',
  ADD_CIRCLE = 'add_circle',
  ADD_ELLIPSE = 'add_ellipse',
  ADD_POLYGON = 'add_polygon',
  ADD_TEXT = 'add_text',
  MOVE = 'move',
}
