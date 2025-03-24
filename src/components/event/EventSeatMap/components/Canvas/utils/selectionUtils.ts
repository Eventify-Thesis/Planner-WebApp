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
          const areaBox = {
            x1: area.position.x,
            y1: area.position.y,
            x2: area.position.x + (area.size?.width || 0),
            y2: area.position.y + (area.size?.height || 0),
          };

          if (area.type === 'circle' && 'radius' in area) {
            areaBox.x1 = area.position.x - area.radius;
            areaBox.y1 = area.position.y - area.radius;
            areaBox.x2 = area.position.x + area.radius;
            areaBox.y2 = area.position.y + area.radius;
          } else if (area.type === 'ellipse' && area.size) {
            areaBox.x1 = area.position.x - area.size.width / 2;
            areaBox.y1 = area.position.y - area.size.height / 2;
            areaBox.x2 = area.position.x + area.size.width / 2;
            areaBox.y2 = area.position.y + area.size.height / 2;
          }

          if (
            areaBox.x1 <= bounds.x2 &&
            areaBox.x2 >= bounds.x1 &&
            areaBox.y1 <= bounds.y2 &&
            areaBox.y2 >= bounds.y1
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
      if (isPointInBounds(area.position, bounds)) {
        selectedItems.areas.push(area.uuid);
      }
    });
  }

  return { selectedItems };
};
