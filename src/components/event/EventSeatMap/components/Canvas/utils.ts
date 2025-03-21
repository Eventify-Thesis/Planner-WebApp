import { v4 as uuidv4 } from 'uuid';
import { Point, Row, Seat, Shape, TextLabel, Size } from '../../types';

export const createSeat = (position: Point, category?: string): Seat => ({
  uuid: uuidv4(),
  position,
  category,
});

export const createStraightRow = (
  startPoint: Point,
  endPoint: Point,
  numSeats: number,
): Row => {
  const seats: Seat[] = [];
  const rowId = uuidv4();
  const dx = (endPoint.x - startPoint.x) / (numSeats - 1);
  const dy = (endPoint.y - startPoint.y) / (numSeats - 1);

  for (let i = 0; i < numSeats; i++) {
    seats.push({
      uuid: uuidv4(),
      position: {
        x: startPoint.x + dx * i,
        y: startPoint.y + dy * i,
      },
      number: i + 1,
      radius: 15,
      rowId,
    });
  }

  return {
    uuid: rowId,
    position: startPoint,
    rowNumber: 1,
    seatSpacing: Math.sqrt(dx * dx + dy * dy),
    seatRadius: 15,
    seats,
    type: 'straight',
    startNumber: 1,
    numberingType: 'continuous',
    numberFormat: 'numeric',
  };
};

export const createRectangularRow = (
  startPoint: Point,
  size: Size,
  numRows: number,
  seatsPerRow: number,
): Row => {
  const seats: Seat[] = [];
  const rowId = uuidv4();
  const dx = size.width / (seatsPerRow - 1);
  const dy = size.height / (numRows - 1);

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < seatsPerRow; col++) {
      seats.push({
        uuid: uuidv4(),
        position: {
          x: startPoint.x + dx * col,
          y: startPoint.y + dy * row,
        },
        number: row * seatsPerRow + col + 1,
        radius: 15,
        rowId,
      });
    }
  }

  return {
    uuid: rowId,
    position: startPoint,
    rowNumber: 1,
    seatSpacing: dx,
    seatRadius: 15,
    seats,
    type: 'rectangular',
    startNumber: 1,
    numberingType: 'continuous',
    numberFormat: 'numeric',
  };
};

export const createCircularRow = (
  center: Point,
  radius: number,
  numSeats: number,
  startAngle: number = 0,
  endAngle: number = Math.PI * 2,
): Row => {
  const seats: Seat[] = [];
  const rowId = uuidv4();
  const angleStep = (endAngle - startAngle) / numSeats;

  for (let i = 0; i < numSeats; i++) {
    const angle = startAngle + angleStep * i;
    seats.push({
      uuid: uuidv4(),
      position: {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      },
      number: i + 1,
      radius: 15,
      rowId,
    });
  }

  return {
    uuid: rowId,
    position: center,
    rowNumber: 1,
    seatSpacing: (2 * Math.PI * radius) / numSeats,
    seatRadius: 15,
    seats,
    type: 'circular',
    startNumber: 1,
    numberingType: 'continuous',
    numberFormat: 'numeric',
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
