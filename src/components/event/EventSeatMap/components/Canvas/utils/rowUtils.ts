import { Point, Row, Seat } from '../../../types';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_SETTINGS = {
  SEAT_SPACING: 35,
  SEAT_RADIUS: 15,
  START_NUMBER: 1,
} as const;

export const calculateRowDimensions = (startPoint: Point, endPoint: Point) => {
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);
  const x = Math.min(startPoint.x, endPoint.x);
  const y = Math.min(startPoint.y, endPoint.y);

  return { width, height, x, y };
};

export const createSeat = (
  position: Point,
  number: string,
  radius: number = DEFAULT_SETTINGS.SEAT_RADIUS,
  category?: string,
): Seat => ({
  uuid: uuidv4(),
  position,
  number,
  radius,
  category,
});

export const calculateSeatPositions = (
  startPoint: Point,
  endPoint: Point,
  numSeats: number,
  spacing: number = DEFAULT_SETTINGS.SEAT_SPACING,
): Point[] => {
  // Calculate direction vector
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vector
  const dirX = dx / length;
  const dirY = dy / length;

  return Array.from({ length: numSeats }).map((_, i) => ({
    x: startPoint.x + dirX * spacing * i,
    y: startPoint.y + dirY * spacing * i,
  }));
};

export const createStraightRow = (
  startPoint: Point,
  endPoint: Point,
  numSeats: number,
  seatSpacing: number = DEFAULT_SETTINGS.SEAT_SPACING,
  seatRadius: number = DEFAULT_SETTINGS.SEAT_RADIUS,
  defaultCategory?: string,
): Row => {
  const seatPositions = calculateSeatPositions(
    startPoint,
    endPoint,
    numSeats,
    seatSpacing,
  );

  const seats: Seat[] = seatPositions.map((position, i) =>
    createSeat(position, String(i + 1), seatRadius, defaultCategory),
  );

  return {
    uuid: uuidv4(),
    seats,
    seatSpacing,
    seatRadius,
    defaultCategory,
    type: 'straight',
    numberingType: 'continuous',
    startNumber: DEFAULT_SETTINGS.START_NUMBER,
    rowNumber: 1,
  };
};

export const createRectangularRow = (
  position: Point,
  size: { width: number; height: number },
  numRows: number,
  seatsPerRow: number,
  seatSpacing: number = DEFAULT_SETTINGS.SEAT_SPACING,
  seatRadius: number = DEFAULT_SETTINGS.SEAT_RADIUS,
  defaultCategory?: string,
): Row[] => {
  return Array.from({ length: numRows }).map((_, rowIndex) => {
    const rowStartPoint = {
      x: position.x,
      y: position.y + seatSpacing * rowIndex,
    };
    const rowEndPoint = {
      x: position.x + size.width,
      y: position.y + seatSpacing * rowIndex,
    };

    const seatPositions = calculateSeatPositions(
      rowStartPoint,
      rowEndPoint,
      seatsPerRow,
      seatSpacing,
    );

    const seats: Seat[] = seatPositions.map((pos, seatIndex) =>
      createSeat(
        pos,
        `${rowIndex + 1}-${seatIndex + 1}`,
        seatRadius,
        defaultCategory,
      ),
    );

    return {
      uuid: uuidv4(),
      seats,
      seatSpacing,
      seatRadius,
      defaultCategory,
      type: 'rectangular',
      numberingType: 'perRow',
      startNumber: DEFAULT_SETTINGS.START_NUMBER,
      rowNumber: rowIndex + 1,
    };
  });
};

export const renderRowPreview = (
  startPoint: Point,
  endPoint: Point,
  commonProps: any,
) => {
  const { width } = calculateRowDimensions(startPoint, endPoint);
  const numSeats = Math.max(Math.round(width / 30), 2);
  const dx = (endPoint.x - startPoint.x) / (numSeats - 1 || 1);
  const dy = (endPoint.y - startPoint.y) / (numSeats - 1 || 1);

  return {
    numSeats,
    dx,
    dy,
    linePoints: [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
    seatPositions: Array.from({ length: numSeats }).map((_, i) => ({
      x: startPoint.x + dx * i,
      y: startPoint.y + dy * i,
    })),
  };
};

export const renderRectRowPreview = (startPoint: Point, endPoint: Point) => {
  const { width, height, x, y } = calculateRowDimensions(startPoint, endPoint);
  const seatsPerRow = Math.max(Math.round(width / 30), 2);
  const numRows = Math.max(Math.round(height / 30), 2);
  const dx = width / (seatsPerRow - 1 || 1);
  const dy = height / (numRows - 1 || 1);

  return {
    seatsPerRow,
    numRows,
    dx,
    dy,
    x,
    y,
    width,
    height,
    rowLines: Array.from({ length: numRows + 1 }).map((_, row) => ({
      points: [x, y + dy * row, x + width, y + dy * row],
    })),
    seatPositions: Array.from({ length: numRows }).flatMap((_, row) =>
      Array.from({ length: seatsPerRow }).map((_, col) => ({
        x: x + dx * col,
        y: y + dy * row,
        key: `${row}-${col}`,
      })),
    ),
  };
};
