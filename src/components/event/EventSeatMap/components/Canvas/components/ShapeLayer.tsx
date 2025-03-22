import React, { memo } from 'react';
import { Layer, Text, Rect, Circle, Ellipse } from 'react-konva';
import { SeatingPlan, Selection, EditorTool } from '../../../types';
import { getShapeStyles } from '../utils/styleUtils';
import { getMousePosition } from '../utils/mouseUtils';

interface ShapeLayerProps {
  seatingPlan: SeatingPlan;
  selection: Selection;
  currentTool: EditorTool;
  zoom: number;
  onPlanChange: (plan: SeatingPlan) => void;
  onSelect: (type: 'shape', id: string, event?: any) => void;
}

export const ShapeLayer = memo(({
  seatingPlan,
  selection,
  currentTool,
  zoom,
  onPlanChange,
  onSelect,
}: ShapeLayerProps) => {
  const handleDragEnd = (e: any, uuid: string) => {
    const pos = getMousePosition(e, zoom);
    if (!pos) return;

    const updatedPlan = { ...seatingPlan };
    updatedPlan.zones = updatedPlan.zones.map((z) => ({
      ...z,
      areas: z.areas.map((a) =>
        a.uuid === uuid ? { ...a, position: pos } : a
      ),
    }));
    onPlanChange(updatedPlan);
  };

  return (
    <Layer>
      {seatingPlan.zones.flatMap((zone) =>
        zone.areas.map((area) => {
          const isSelected =
            selection.type === 'shape' && selection.ids.includes(area.uuid);

          if ('text' in area) {
            return (
              <Text
                key={area.uuid}
                x={area.position.x}
                y={area.position.y}
                text={area.text}
                fontSize={area.fontSize}
                fontFamily={area.fontFamily}
                fill={area.fill}
                draggable={currentTool === EditorTool.SELECT_ROW}
                onClick={() => onSelect('shape', area.uuid)}
                onDragEnd={(e) => handleDragEnd(e, area.uuid)}
                {...getShapeStyles(area, isSelected)}
              />
            );
          }

          const commonProps = {
            draggable: currentTool === EditorTool.SELECT_ROW,
            onClick: () => onSelect('shape', area.uuid),
            onDragEnd: (e: any) => handleDragEnd(e, area.uuid),
            ...getShapeStyles(area, isSelected),
          };

          switch (area.type) {
            case 'rectangle':
              return (
                <Rect
                  key={area.uuid}
                  x={area.position.x}
                  y={area.position.y}
                  width={area.size?.width || 0}
                  height={area.size?.height || 0}
                  {...commonProps}
                />
              );
            case 'circle':
              return (
                <Circle
                  key={area.uuid}
                  x={area.position.x}
                  y={area.position.y}
                  radius={area.radius || 0}
                  {...commonProps}
                />
              );
            case 'ellipse':
              return (
                <Ellipse
                  key={area.uuid}
                  x={area.position.x}
                  y={area.position.y}
                  radiusX={area.size?.width ? area.size.width / 2 : 0}
                  radiusY={area.size?.height ? area.size.height / 2 : 0}
                  {...commonProps}
                />
              );
            default:
              return null;
          }
        })
      )}
    </Layer>
  );
});

ShapeLayer.displayName = 'ShapeLayer';
