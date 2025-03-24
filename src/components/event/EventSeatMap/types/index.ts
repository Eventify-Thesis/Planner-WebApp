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
  number: string;
  radius?: number;
  category?: string;
}

export interface Row {
  uuid: string;
  seats: Seat[];
  seatSpacing?: number;
  seatRadius?: number;
  defaultCategory?: string;
  type: 'straight' | 'rectangular';
  numberingType: 'continuous' | 'perRow';
  startNumber: number;
  rowNumber: number;
  label?: string;
}

export interface Shape {
  uuid: string;
  type: 'rectangle' | 'circle' | 'text';
  position: Point;
  size: Size;
  rotation: number;
  fill: string;
  stroke: string;
  text?: string;
  textSize?: number;
  textPosition?: Point;
  textColor?: string;
}

/**
 * Represents a zone within a seating plan.
 *
 * @property {string} uuid - Unique identifier for the zone.
 * @property {string} name - Name of the zone.
 * @property {string} zone_id - Identifier for referencing the zone.
 * @property {Point} position - The position of the zone on the seating plan.
 * @property {Row[]} rows - The list of rows contained in the zone.
 * @property {Shape[]} shapes - The list of shapes contained in the zone.
 * @property {any[]} areas - The list of areas in the zone. TODO: Define Area type if needed.
 */
export interface Zone {
  uuid: string;
  name: string;
  zone_id: string;
  position: Point;
  rows: Row[];
  areas: Shape[]; // TODO: Define Area type if needed
}

export interface SeatingPlan {
  id: string;
  name: string;
  size: Size;
  categories: Category[];
  zones: Zone[];
  backgroundImage?: string;
}

export interface Selection {
  selectedItems: {
    seats: string[];
    rows: string[];
    areas: string[];
  };
}

export enum EditorTool {
  SELECT_SEAT = 'SELECT_SEAT',
  SELECT_ROW = 'SELECT_ROW',
  SELECT_SHAPE = 'SELECT_SHAPE',
  ADD_SHAPE = 'ADD_SHAPE',
  ADD_CIRCLE = 'ADD_CIRCLE',
  ADD_ELLIPSE = 'ADD_ELLIPSE',
  ADD_TEXT = 'ADD_TEXT',
  ADD_POLYGON = 'ADD_POLYGON',
  ADD_ROW = 'ADD_ROW',
  ADD_RECT_ROW = 'ADD_RECT_ROW',
  ADD_CIRCULAR_ROW = 'ADD_CIRCULAR_ROW',
  NONE = 'NONE',
  MOVE = 'move',
}
