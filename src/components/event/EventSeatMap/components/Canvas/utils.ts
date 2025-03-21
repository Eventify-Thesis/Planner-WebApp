import { v4 as uuidv4 } from 'uuid';
import { Point, Row, Seat, Shape, TextLabel } from '../../types';

export const createSeat = (position: Point, category?: string): Seat => ({
  uuid: uuidv4(),
  position,
  category,
});

export const createCircularRow = (
  center: Point,
  radius: number,
  numSeats: number,
): Row => {
  const seats: Seat[] = [];
  const angleStep = (2 * Math.PI) / numSeats;

  for (let i = 0; i < numSeats; i++) {
    const angle = i * angleStep;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    seats.push(createSeat({ x, y }));
  }

  return {
    uuid: uuidv4(),
    type: 'circular',
    position: center,
    angle: 0,
    seats,
  };
};

export const createStraightRow = (
  start: Point,
  end: Point,
  numSeats: number,
): Row => {
  const seats: Seat[] = [];
  const dx = (end.x - start.x) / (numSeats - 1);
  const dy = (end.y - start.y) / (numSeats - 1);
  const angle = Math.atan2(dy, dx);

  for (let i = 0; i < numSeats; i++) {
    const x = start.x + dx * i;
    const y = start.y + dy * i;
    seats.push(createSeat({ x, y }));
  }

  return {
    uuid: uuidv4(),
    type: 'straight',
    position: start,
    angle,
    seats,
  };
};

export const createRectangularRow = (
  start: Point,
  size: { width: number; height: number },
  rows: number,
  seatsPerRow: number,
): Row => {
  const seats: Seat[] = [];
  const dx = size.width / (seatsPerRow - 1);
  const dy = size.height / (rows - 1);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < seatsPerRow; col++) {
      const x = start.x + dx * col;
      const y = start.y + dy * row;
      seats.push(createSeat({ x, y }));
    }
  }

  return {
    uuid: uuidv4(),
    type: 'rectangular',
    position: start,
    size,
    seats,
  };
};

export const createShape = (
  type: Shape['type'],
  position: Point,
  props: Partial<Shape>,
): Shape => ({
  uuid: uuidv4(),
  type,
  position,
  fill: 'rgba(200, 200, 200, 0.5)',
  stroke: '#666',
  ...props,
});

export const createTextLabel = (position: Point, text: string): TextLabel => ({
  uuid: uuidv4(),
  position,
  text,
  fontSize: 16,
  fontFamily: 'Arial',
  fill: '#000',
});

export const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const snapToGrid = (point: Point, gridSize: number): Point => ({
  x: Math.round(point.x / gridSize) * gridSize,
  y: Math.round(point.y / gridSize) * gridSize,
});
