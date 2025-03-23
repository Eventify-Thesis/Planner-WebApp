import { Point, Row, Seat } from '../../../types';
import { v4 as uuidv4 } from 'uuid';

export const calculateRowDimensions = (startPoint: Point, endPoint: Point) => {
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);
  const x = Math.min(startPoint.x, endPoint.x);
  const y = Math.min(startPoint.y, endPoint.y);

  return { width, height, x, y };
};

export const createSeat = (position: Point, number: string): Seat => ({
  uuid: uuidv4(),
  position,
  number,
  radius: 15,
});

export const createStraightRow = (
  startPoint: Point,
  endPoint: Point,
  numSeats: number,
): Row => {
  const dx = (endPoint.x - startPoint.x) / (numSeats - 1 || 1);
  const dy = (endPoint.y - startPoint.y) / (numSeats - 1 || 1);

  const seats: Seat[] = Array.from({ length: numSeats }).map((_, i) => {
    const position = {
      x: startPoint.x + dx * i,
      y: startPoint.y + dy * i,
    };
    return createSeat(position, String(i + 1));
  });

  return {
    uuid: uuidv4(),
    seats,
  };
};

export const createRectangularRow = (
  position: Point,
  size: { width: number; height: number },
  numRows: number,
  seatsPerRow: number,
): Row[] => {
  const dx = size.width / (seatsPerRow - 1 || 1);
  const dy = size.height / (numRows - 1 || 1);

  return Array.from({ length: numRows }).map((_, rowIndex) => {
    const seats: Seat[] = Array.from({ length: seatsPerRow }).map(
      (_, seatIndex) => {
        const seatPosition = {
          x: position.x + dx * seatIndex,
          y: position.y + dy * rowIndex,
        };
        return createSeat(seatPosition, `${rowIndex + 1}-${seatIndex + 1}`);
      },
    );

    return {
      uuid: uuidv4(),
      seats,
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
