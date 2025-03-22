import { CONSTANTS } from '../constants';

export const getShapeStyles = (item: any, isSelected: boolean) => {
  return {
    fill: isSelected
      ? CONSTANTS.STYLE.SELECTED.FILL
      : item.fill || CONSTANTS.STYLE.DEFAULT.FILL,
    stroke: isSelected
      ? CONSTANTS.STYLE.SELECTED.STROKE
      : item.stroke || CONSTANTS.STYLE.DEFAULT.STROKE,
    strokeWidth: isSelected ? 2 : 1,
  };
};

export const getSeatStyles = (
  seat: any,
  isSelected: boolean,
  isHighlighted: boolean,
) => {
  let fillColor = CONSTANTS.STYLE.DEFAULT.FILL;
  let strokeColor = CONSTANTS.STYLE.DEFAULT.STROKE;

  if (isSelected) {
    fillColor = CONSTANTS.STYLE.SELECTED.FILL;
    strokeColor = CONSTANTS.STYLE.SELECTED.STROKE;
  } else if (isHighlighted) {
    fillColor = CONSTANTS.STYLE.SELECTED.FILL_LIGHT;
    strokeColor = CONSTANTS.STYLE.SELECTED.STROKE;
  } else if (seat.category) {
    fillColor =
      seat.seatingPlan.categories.find((c: any) => c.name === seat.category)
        ?.color || CONSTANTS.STYLE.DEFAULT.FILL;
  }

  return {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: isSelected ? 2 : 1,
  };
};
