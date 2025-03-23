import { Point } from '../../../types';

export const getMousePosition = (event: any, zoom: number): Point | null => {
  // For React Konva drag events
  if (event.target && event.target.getStage) {
    const stage = event.target.getStage();
    const point = stage.getPointerPosition();
    return {
      x: point.x / zoom,
      y: point.y / zoom,
    };
  }

  // For regular Konva events
  if (event.currentTarget && event.currentTarget.getStage) {
    const stage = event.currentTarget.getStage();
    const point = stage.getPointerPosition();
    return {
      x: point.x / zoom,
      y: point.y / zoom,
    };
  }

  return null;
};

export const getSelectionBox = (startPoint: Point, endPoint: Point) => {
  return {
    x: Math.min(startPoint.x, endPoint.x),
    y: Math.min(startPoint.y, endPoint.y),
    width: Math.abs(startPoint.x - endPoint.x),
    height: Math.abs(startPoint.y - endPoint.y),
  };
};

export const isPointInBox = (
  point: Point,
  box: { x: number; y: number; width: number; height: number },
) => {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
};
