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
  const rowId = uuidv4();
  numSeats = Math.max(2, numSeats);
  
  const dx = (endPoint.x - startPoint.x) / (numSeats - 1);
  const dy = (endPoint.y - startPoint.y) / (numSeats - 1);
  const seatSpacing = Math.sqrt(dx * dx + dy * dy);

  // Pre-allocate seats array for better performance
  const seats = new Array(numSeats);
  for (let i = 0; i < numSeats; i++) {
    seats[i] = {
      uuid: uuidv4(),
      position: {
        x: startPoint.x + dx * i,
        y: startPoint.y + dy * i,
      },
      number: i + 1,
      radius: 15,
      rowId,
    };
  }

  return {
    uuid: rowId,
    position: startPoint,
    rowNumber: 1,
    seatSpacing,
    seatRadius: 15,
    seats,
    type: 'straight',
    startNumber: 1,
    numberingType: 'continuous',
    numberFormat: 'numeric',
  };
};

export const createRectangularRow = (
  position: Point,
  size: { width: number; height: number },
  numRows: number,
  seatsPerRow: number,
): Row[] => {
  seatsPerRow = Math.max(2, seatsPerRow);
  numRows = Math.max(2, numRows);
  
  const dx = size.width / (seatsPerRow - 1);
  const dy = size.height / (numRows - 1);
  
  // Pre-allocate rows array for better performance
  const rows = new Array(numRows);
  
  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    const rowUuid = uuidv4();
    // Pre-allocate seats array for better performance
    const seats = new Array(seatsPerRow);
    
    for (let seatIndex = 0; seatIndex < seatsPerRow; seatIndex++) {
      seats[seatIndex] = {
        uuid: uuidv4(),
        rowId: rowUuid,
        position: {
          x: position.x + dx * seatIndex,
          y: position.y + dy * rowIndex,
        },
        number: seatIndex + 1,
        radius: 15,
      };
    }

    rows[rowIndex] = {
      uuid: rowUuid,
      position: { x: position.x, y: position.y + dy * rowIndex },
      rowNumber: rowIndex + 1,
      seatSpacing: dx,
      seatRadius: 15,
      seats,
      type: 'rectangular',
      startNumber: 1,
      numberingType: 'continuous',
      numberFormat: 'numeric',
    };
  }

  return rows;
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
  strokeWidth: 1,
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
