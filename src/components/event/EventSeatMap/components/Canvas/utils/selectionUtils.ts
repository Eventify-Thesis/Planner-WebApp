import { SeatingPlan, Point, Selection, SelectionBox } from '../../../types';

export const isPointInBounds = (
  point: Point,
  bounds: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};

export const getItemsInSelectionBox = (
  seatingPlan: SeatingPlan,
  selectionBox: SelectionBox,
  type: 'seat' | 'row'
): string[] => {
  const selectedIds: string[] = [];
  const box = {
    x: Math.min(selectionBox.startPoint.x, selectionBox.endPoint.x),
    y: Math.min(selectionBox.startPoint.y, selectionBox.endPoint.y),
    width: Math.abs(selectionBox.endPoint.x - selectionBox.startPoint.x),
    height: Math.abs(selectionBox.endPoint.y - selectionBox.startPoint.y),
  };

  seatingPlan.zones.forEach((zone) => {
    if (type === 'seat') {
      zone.rows.forEach((row) => {
        row.seats.forEach((seat) => {
          const seatBounds = {
            x: seat.position.x - (seat.radius || 15),
            y: seat.position.y - (seat.radius || 15),
            width: (seat.radius || 15) * 2,
            height: (seat.radius || 15) * 2,
          };

          if (
            seatBounds.x <= box.x + box.width &&
            seatBounds.x + seatBounds.width >= box.x &&
            seatBounds.y <= box.y + box.height &&
            seatBounds.y + seatBounds.height >= box.y
          ) {
            selectedIds.push(seat.uuid);
          }
        });
      });
    } else {
      zone.rows.forEach((row) => {
        const rowBounds = row.seats.reduce(
          (bounds, seat) => {
            bounds.minX = Math.min(bounds.minX, seat.position.x);
            bounds.maxX = Math.max(bounds.maxX, seat.position.x);
            bounds.minY = Math.min(bounds.minY, seat.position.y);
            bounds.maxY = Math.max(bounds.maxY, seat.position.y);
            return bounds;
          },
          {
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
          }
        );

        if (
          rowBounds.minX <= box.x + box.width &&
          rowBounds.maxX >= box.x &&
          rowBounds.minY <= box.y + box.height &&
          rowBounds.maxY >= box.y
        ) {
          selectedIds.push(row.uuid);
        }
      });

      // Also check shapes when in row selection mode
      zone.areas.forEach((area) => {
        if ('position' in area) {
          const areaBox = {
            x: area.position.x,
            y: area.position.y,
            width: area.size?.width || 0,
            height: area.size?.height || 0,
          };

          if (area.type === 'circle' && 'radius' in area) {
            areaBox.x = area.position.x - area.radius;
            areaBox.y = area.position.y - area.radius;
            areaBox.width = area.radius * 2;
            areaBox.height = area.radius * 2;
          } else if (area.type === 'ellipse' && area.size) {
            areaBox.x = area.position.x - area.size.width / 2;
            areaBox.y = area.position.y - area.size.height / 2;
          }

          if (
            areaBox.x <= box.x + box.width &&
            areaBox.x + areaBox.width >= box.x &&
            areaBox.y <= box.y + box.height &&
            areaBox.y + areaBox.height >= box.y
          ) {
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
  type: 'seat' | 'row'
): Selection => {
  const selectedIds = getItemsInSelectionBox(seatingPlan, selectionBox, type);
  return selectedIds.length > 0 ? { type, ids: selectedIds } : { type: 'none', ids: [] };
};
