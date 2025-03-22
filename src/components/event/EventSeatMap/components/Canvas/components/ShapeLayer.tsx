import React, { memo } from 'react';
import { Layer, Text, Rect, Circle, Ellipse, Line } from 'react-konva';
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

export const ShapeLayer = memo(
  ({
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
          a.uuid === uuid ? { ...a, position: pos } : a,
        ),
      }));
      onPlanChange(updatedPlan);
    };

    return (
      <Layer>
        {seatingPlan.zones.flatMap((zone) =>
          zone.areas.map((area) => {
            const isSelected =
              (selection.type === 'shape' || selection.type === 'row') &&
              selection.ids.includes(area.uuid);

            const commonProps = {
              draggable:
                currentTool === EditorTool.SELECT_ROW ||
                currentTool === EditorTool.SELECT_SHAPE,
              onClick: (e: any) => onSelect('shape', area.uuid, e),
              onDragEnd: (e: any) => handleDragEnd(e, area.uuid),
              onMouseEnter: (e: any) => {
                if (
                  currentTool === EditorTool.SELECT_ROW ||
                  currentTool === EditorTool.SELECT_SHAPE
                ) {
                  e.target.getStage()!.container().style.cursor = 'pointer';
                }
              },
              onMouseLeave: (e: any) => {
                e.target.getStage()!.container().style.cursor = 'default';
              },
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
              case 'polygon':
                return (
                  <Line
                    key={area.uuid}
                    points={area.points || []}
                    closed={true}
                    {...commonProps}
                  />
                );
              case 'text':
                return (
                  <Text
                    key={area.uuid}
                    x={area.position.x}
                    y={area.position.y}
                    text={area.text || ''}
                    fontSize={area.fontSize || 16}
                    fontFamily={area.fontFamily || 'Arial'}
                    fill={area.fill || '#000'}
                    {...commonProps}
                  />
                );
              default:
                return null;
            }
          }),
        )}
      </Layer>
    );
  },
);

ShapeLayer.displayName = 'ShapeLayer';
