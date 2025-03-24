import { CONSTANTS } from '../constants';
import { Seat, Category } from '../../../types';

export const getShapeStyles = (item: any, isSelected: boolean) => {
  return {
    fill: item.fill
      ? item.fill
      : isSelected
      ? CONSTANTS.STYLE.SELECTED.FILL
      : CONSTANTS.STYLE.DEFAULT.FILL,
    stroke: item.stroke
      ? item.stroke
      : isSelected
      ? CONSTANTS.STYLE.SELECTED.STROKE
      : item.stroke || CONSTANTS.STYLE.DEFAULT.STROKE,
    strokeWidth: isSelected ? 2 : 1,
  };
};

export const getSeatStyles = (
  seat: Seat,
  isSelected: boolean,
  isHighlighted: boolean,
  categories: Category[] = [],
) => {
  let fillColor = CONSTANTS.STYLE.DEFAULT.FILL;
  let strokeColor = CONSTANTS.STYLE.DEFAULT.STROKE;

  if (isSelected) {
    if (seat.category) {
      const category = categories.find((c) => c.name === seat.category);
      fillColor = category?.color || CONSTANTS.STYLE.DEFAULT.FILL;
    } else fillColor = CONSTANTS.STYLE.SELECTED.FILL;
    strokeColor = CONSTANTS.STYLE.SELECTED.STROKE;
  } else if (isHighlighted) {
    fillColor = CONSTANTS.STYLE.SELECTED.FILL_LIGHT;
    strokeColor = CONSTANTS.STYLE.SELECTED.STROKE;
  } else if (seat.category) {
    const category = categories.find((c) => c.name === seat.category);
    fillColor = category?.color || CONSTANTS.STYLE.DEFAULT.FILL;
  }

  return {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: isSelected ? 2 : 1,
  };
};
