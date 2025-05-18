import { Point, SeatingPlan } from '../../../types';

export const updateItemPosition = (
  seatingPlan: SeatingPlan,
  itemId: string,
  newPosition: Point,
  type: 'seat' | 'row' | 'shape' | 'section',
): SeatingPlan => {
  const updatedPlan = { ...seatingPlan };

  switch (type) {
    case 'seat':
      updatedPlan.zones = updatedPlan.zones.map((zone) => ({
        ...zone,
        rows: zone.rows.map((row) => ({
          ...row,
          seats: row.seats.map((seat) =>
            seat.uuid === itemId ? { ...seat, position: newPosition } : seat,
          ),
        })),
      }));
      break;

    case 'row': {
      const rowToMove = updatedPlan.zones
        .flatMap((z) => z.rows)
        .find((r) => r.uuid === itemId);

      if (rowToMove) {
        const firstSeat = rowToMove.seats[0];
        const dx = newPosition.x - firstSeat.position.x;
        const dy = newPosition.y - firstSeat.position.y;

        updatedPlan.zones = updatedPlan.zones.map((zone) => ({
          ...zone,
          rows: zone.rows.map((row) =>
            row.uuid === itemId
              ? {
                  ...row,
                  seats: row.seats.map((seat) => ({
                    ...seat,
                    position: {
                      x: seat.position.x + dx,
                      y: seat.position.y + dy,
                    },
                  })),
                }
              : row,
          ),
        }));
      }
      break;
    }

    case 'shape':
      updatedPlan.zones = updatedPlan.zones.map((zone) => ({
        ...zone,
        areas: zone.areas.map((area) =>
          area.uuid === itemId ? { ...area, position: newPosition } : area,
        ),
      }));
      break;

    case 'section':
      updatedPlan.zones = updatedPlan.zones.map((zone) => ({
        ...zone,
        sections: zone.sections.map((section) =>
          section.uuid === itemId
            ? { ...section, position: newPosition }
            : section,
        ),
      }));
      break;
  }

  return updatedPlan;
};

export const createDragPreview = (
  seatingPlan: SeatingPlan,
  itemId: string,
  type: 'seat' | 'row' | 'shape' | 'section',
) => {
  if (type === 'row') {
    const row = seatingPlan.zones
      .flatMap((z) => z.rows)
      .find((r) => r.uuid === itemId);

    if (row) {
      const firstSeat = row.seats[0];
      return {
        type: 'row',
        uuid: row.uuid,
        position: firstSeat.position,
        seats: row.seats,
      };
    }
  } else if (type === 'seat') {
    const seat = seatingPlan.zones
      .flatMap((z) => z.rows)
      .flatMap((r) => r.seats)
      .find((s) => s.uuid === itemId);

    if (seat) {
      return {
        type: 'seat',
        uuid: seat.uuid,
        position: seat.position,
        seats: [seat],
      };
    }
  } else if (type === 'shape') {
    const shape = seatingPlan.zones
      .flatMap((z) => z.areas)
      .find((a) => a.uuid === itemId);

    if (shape) {
      return {
        type: 'shape',
        uuid: shape.uuid,
        position: shape.position,
      };
    }
  } else if (type === 'section') {
    const section = seatingPlan.zones
      .flatMap((z) => z.sections || [])
      .find((s) => s.uuid === itemId);

    if (section) {
      return {
        type: 'section',
        uuid: section.uuid,
        position: section.position,
      };
    }
  }

  return null;
};
