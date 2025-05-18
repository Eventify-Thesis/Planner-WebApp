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

export const getSectionStyles = (
  item: any,
  isSelected: boolean,
  categories: Category[],
) => {
  let fillColor = CONSTANTS.STYLE.DEFAULT.FILL;
  let strokeColor = CONSTANTS.STYLE.DEFAULT.STROKE;
  let strokeWidth = item.strokeWidth || 1;

  const baseFill = isSelected
    ? CONSTANTS.STYLE.SELECTED.FILL
    : CONSTANTS.STYLE.DEFAULT.FILL;
  const baseStroke = isSelected
    ? CONSTANTS.STYLE.SELECTED.STROKE
    : CONSTANTS.STYLE.DEFAULT.STROKE;
  const baseStrokeWidth = isSelected
    ? item.strokeWidth * 2 || 2
    : item.strokeWidth || 1;

  // Apply category color if exists
  const category = item.category
    ? categories.find((c) => c.name === item.category)
    : null;
  const categoryColor = category?.color;

  // Determine final values
  fillColor = categoryColor || item.fill || baseFill;
  strokeColor = item.stroke || baseStroke;
  strokeWidth = baseStrokeWidth;

  return {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
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
