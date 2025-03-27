import { Point, SeatingPlan, Selection, SelectionBox } from '../../../types';

interface Bounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const isPointInBounds = (point: Point, bounds: Bounds): boolean => {
  return (
    point.x >= bounds.x1 &&
    point.x <= bounds.x2 &&
    point.y >= bounds.y1 &&
    point.y <= bounds.y2
  );
};

const isRectIntersectBounds = (
  position: Point,
  width: number,
  height: number,
  bounds: Bounds,
): boolean => {
  return !(
    position.x + width < bounds.x1 ||
    position.x > bounds.x2 ||
    position.y + height < bounds.y1 ||
    position.y > bounds.y2
  );
};

const isCircleIntersectBounds = (
  center: Point,
  radius: number,
  bounds: Bounds,
): boolean => {
  // Find closest point to the circle within the rectangle
  const closestX = Math.max(bounds.x1, Math.min(center.x, bounds.x2));
  const closestY = Math.max(bounds.y1, Math.min(center.y, bounds.y2));

  // Calculate distance between circle's center and closest point
  const distanceX = center.x - closestX;
  const distanceY = center.y - closestY;

  // If distance is less than circle's radius, an intersection occurs
  return (distanceX * distanceX + distanceY * distanceY) <= (radius * radius);
};

const isEllipseIntersectBounds = (
  center: Point,
  radiusX: number,
  radiusY: number,
  bounds: Bounds,
): boolean => {
  // Check if any corner of the bounds is inside the ellipse
  const corners = [
    { x: bounds.x1, y: bounds.y1 },
    { x: bounds.x2, y: bounds.y1 },
    { x: bounds.x2, y: bounds.y2 },
    { x: bounds.x1, y: bounds.y2 },
  ];

  // Check if any corner is inside the ellipse
  const insideCorner = corners.some(corner => {
    const normalizedX = (corner.x - center.x) / radiusX;
    const normalizedY = (corner.y - center.y) / radiusY;
    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
  });

  if (insideCorner) return true;

  // Check if ellipse intersects with any of the rectangle's edges
  const edges = [
    [corners[0], corners[1]],
    [corners[1], corners[2]],
    [corners[2], corners[3]],
    [corners[3], corners[0]],
  ];

  return edges.some(([p1, p2]) => {
    // Transform to ellipse space
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const cx = p1.x - center.x;
    const cy = p1.y - center.y;

    const a = (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY);
    const b = 2 * ((cx * dx) / (radiusX * radiusX) + (cy * dy) / (radiusY * radiusY));
    const c = (cx * cx) / (radiusX * radiusX) + (cy * cy) / (radiusY * radiusY) - 1;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;

    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  });
};

export const getItemsInSelectionBox = (
  seatingPlan: SeatingPlan,
  selectionBox: SelectionBox,
  type: 'seat' | 'row',
): string[] => {
  const selectedIds: string[] = [];
  const bounds: Bounds = {
    x1: Math.min(selectionBox.startPoint.x, selectionBox.endPoint.x),
    y1: Math.min(selectionBox.startPoint.y, selectionBox.endPoint.y),
    x2: Math.max(selectionBox.startPoint.x, selectionBox.endPoint.x),
    y2: Math.max(selectionBox.startPoint.y, selectionBox.endPoint.y),
  };

  seatingPlan.zones.forEach((zone) => {
    if (type === 'seat') {
      zone.rows.forEach((row) => {
        row.seats.forEach((seat) => {
          const seatBounds = {
            x1: seat.position.x - (seat.radius || 15),
            y1: seat.position.y - (seat.radius || 15),
            x2: seat.position.x + (seat.radius || 15),
            y2: seat.position.y + (seat.radius || 15),
          };

          if (
            seatBounds.x1 <= bounds.x2 &&
            seatBounds.x2 >= bounds.x1 &&
            seatBounds.y1 <= bounds.y2 &&
            seatBounds.y2 >= bounds.y1
          ) {
            selectedIds.push(seat.uuid);
          }
        });
      });
    } else {
      zone.rows.forEach((row) => {
        const rowBounds = row.seats.reduce(
          (bounds, seat) => {
            bounds.x1 = Math.min(bounds.x1, seat.position.x);
            bounds.x2 = Math.max(bounds.x2, seat.position.x);
            bounds.y1 = Math.min(bounds.y1, seat.position.y);
            bounds.y2 = Math.max(bounds.y2, seat.position.y);
            return bounds;
          },
          {
            x1: Infinity,
            x2: -Infinity,
            y1: Infinity,
            y2: -Infinity,
          },
        );

        if (
          rowBounds.x1 <= bounds.x2 &&
          rowBounds.x2 >= bounds.x1 &&
          rowBounds.y1 <= bounds.y2 &&
          rowBounds.y2 >= bounds.y1
        ) {
          selectedIds.push(row.uuid);
        }
      });

      // Also check shapes when in row selection mode
      zone.areas.forEach((area) => {
        if ('position' in area) {
          let intersects = false;

          switch (area.type) {
            case 'rectangle':
              intersects = isRectIntersectBounds(
                area.position,
                area.size?.width || 0,
                area.size?.height || 0,
                bounds
              );
              break;

            case 'circle':
              intersects = isCircleIntersectBounds(
                area.position,
                area.radius || 0,
                bounds
              );
              break;

            case 'ellipse':
              intersects = isEllipseIntersectBounds(
                area.position,
                (area.size?.width || 0) / 2,
                (area.size?.height || 0) / 2,
                bounds
              );
              break;

            default:
              // For other shapes, fallback to point-in-bounds
              intersects = isPointInBounds(area.position, bounds);
          }

          if (intersects) {
            selectedIds.push(area.uuid);
          }
        }
      });
    }
  });

  return selectedIds;
};

export const updateSelection = (
  seatingPlan: SeatingPlan,
  selectionBox: SelectionBox,
  selectionType: 'seat' | 'row',
): Selection => {
  const { startPoint, endPoint } = selectionBox;
  const bounds: Bounds = {
    x1: Math.min(startPoint.x, endPoint.x),
    x2: Math.max(startPoint.x, endPoint.x),
    y1: Math.min(startPoint.y, endPoint.y),
    y2: Math.max(startPoint.y, endPoint.y),
  };

  const selectedItems = {
    seats: [] as string[],
    rows: [] as string[],
    areas: [] as string[],
  };

  if (selectionType === 'seat') {
    // Only select seats when in seat selection mode
    seatingPlan.zones[0].rows.forEach((row) => {
      row.seats.forEach((seat) => {
        if (isPointInBounds(seat.position, bounds)) {
          selectedItems.seats.push(seat.uuid);
        }
      });
    });
  } else {
    // Select both rows and shapes when in row selection mode
    seatingPlan.zones[0].rows.forEach((row) => {
      const hasSelectedSeats = row.seats.some((seat) =>
        isPointInBounds(seat.position, bounds),
      );
      if (hasSelectedSeats) {
        selectedItems.rows.push(row.uuid);
      }
    });

    seatingPlan.zones[0].areas.forEach((area) => {
      let intersects = false;

      switch (area.type) {
        case 'rectangle':
          intersects = isRectIntersectBounds(
            area.position,
            area.size?.width || 0,
            area.size?.height || 0,
            bounds
          );
          break;

        case 'circle':
          intersects = isCircleIntersectBounds(
            area.position,
            area.radius || 0,
            bounds
          );
          break;

        case 'ellipse':
          intersects = isEllipseIntersectBounds(
            area.position,
            (area.size?.width || 0) / 2,
            (area.size?.height || 0) / 2,
            bounds
          );
          break;

        default:
          // For other shapes, fallback to point-in-bounds
          intersects = isPointInBounds(area.position, bounds);
      }

      if (intersects) {
        selectedItems.areas.push(area.uuid);
      }
    });
  }

  return { selectedItems };
};
