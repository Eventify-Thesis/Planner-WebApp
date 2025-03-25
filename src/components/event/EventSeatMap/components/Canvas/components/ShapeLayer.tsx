import React, { memo } from 'react';
import { Layer, Text, Rect, Circle, Ellipse, Line } from 'react-konva';
import { SeatingPlan, Selection, EditorTool } from '../../../types/index';
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

interface ShapeTextProps {
  text: any;
  shape: any;
}

const ShapeText = memo(({ text, shape }: ShapeTextProps) => {
  if (!text?.text) return null;

  let centerX = shape.position.x;
  let centerY = shape.position.y;

  // Calculate center based on shape type
  switch (shape.type) {
    case 'rectangle':
      centerX += (shape.size?.width || 0) / 2;
      centerY += (shape.size?.height || 0) / 2;
      break;
    case 'circle':
    case 'ellipse':
    case 'polygon':
      // Center is already at shape.position for these shapes
      break;
  }

  return (
    <Text
      x={text.position?.x ?? centerX}
      y={text.position?.y ?? centerY}
      text={text.text}
      fill={text.color || '#000000'}
      fontSize={14}
      align="center"
      verticalAlign="middle"
      offsetX={7}
      offsetY={7}
      draggable={false}
    />
  );
});

export const ShapeLayer = memo(
  ({
    seatingPlan,
    selection,
    currentTool,
    zoom,
    onPlanChange,
    onSelect,
  }: ShapeLayerProps) => {
    const handleDragStart = (e: any, uuid: string) => {
      const mousePos = getMousePosition(e, zoom);
      if (!mousePos) return;

      // Get the shape being dragged and all selected shapes
      const draggedShape = seatingPlan.zones[0].areas.find(
        (a) => a.uuid === uuid,
      );
      const selectedShapes = seatingPlan.zones[0].areas.filter((a) =>
        selection.selectedItems.areas.includes(a.uuid),
      );

      if (!draggedShape) return;

      // If dragged shape is not in selection, only move that shape
      const shapesToMove = selectedShapes.includes(draggedShape)
        ? selectedShapes
        : [draggedShape];

      e.target.dragStartData = {
        shapes: shapesToMove.map((shape) => ({
          uuid: shape.uuid,
          initialPos: { ...shape.position },
          offset: {
            x: mousePos.x - shape.position.x,
            y: mousePos.y - shape.position.y,
          },
        })),
      };
    };

    const handleDragEnd = (e: any, uuid: string) => {
      const mousePos = getMousePosition(e, zoom);
      if (!mousePos || !e.target.dragStartData) return;

      const { shapes } = e.target.dragStartData;
      const draggedShapeData = shapes.find((s) => s.uuid === uuid);
      if (!draggedShapeData) return;

      // Calculate the movement based on the dragged shape
      const dx =
        mousePos.x - draggedShapeData.offset.x - draggedShapeData.initialPos.x;
      const dy =
        mousePos.y - draggedShapeData.offset.y - draggedShapeData.initialPos.y;

      const updatedPlan = { ...seatingPlan };
      updatedPlan.zones = updatedPlan.zones.map((z) => ({
        ...z,
        areas: z.areas.map((area) => {
          const shapeData = shapes.find((s) => s.uuid === area.uuid);
          if (!shapeData) return area;

          const newPosition = {
            x: shapeData.initialPos.x + dx,
            y: shapeData.initialPos.y + dy,
          };

          return {
            ...area,
            position: newPosition,
            text: area.text
              ? {
                  ...area.text,
                  position: area.text.position
                    ? {
                        x:
                          area.text.position.x -
                          shapeData.initialPos.x +
                          newPosition.x,
                        y:
                          area.text.position.y -
                          shapeData.initialPos.y +
                          newPosition.y,
                      }
                    : undefined,
                }
              : undefined,
          };
        }),
      }));

      onPlanChange(updatedPlan);
    };

    return (
      <Layer>
        {seatingPlan.zones.flatMap((zone) =>
          zone.areas.map((area) => {
            const isSelected = selection.selectedItems.areas.includes(
              area.uuid,
            );
            const commonProps = {
              draggable:
                currentTool === EditorTool.SELECT_ROW ||
                currentTool === EditorTool.SELECT_SHAPE,
              onClick: (e: any) => onSelect('shape', area.uuid, e),
              onDragStart: (e: any) => handleDragStart(e, area.uuid),
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
                  <React.Fragment key={area.uuid}>
                    <Rect
                      id={area.uuid}
                      x={area.position.x}
                      y={area.position.y}
                      width={area.size?.width || 0}
                      height={area.size?.height || 0}
                      {...commonProps}
                    />
                    <ShapeText text={area.text} shape={area} />
                  </React.Fragment>
                );
              case 'circle':
                return (
                  <React.Fragment key={area.uuid}>
                    <Circle
                      id={area.uuid}
                      x={area.position.x}
                      y={area.position.y}
                      radius={area.radius || 0}
                      {...commonProps}
                    />
                    <ShapeText text={area.text} shape={area} />
                  </React.Fragment>
                );
              case 'ellipse':
                return (
                  <React.Fragment key={area.uuid}>
                    <Ellipse
                      id={area.uuid}
                      x={area.position.x}
                      y={area.position.y}
                      radiusX={area.size?.width ? area.size.width / 2 : 0}
                      radiusY={area.size?.height ? area.size.height / 2 : 0}
                      {...commonProps}
                    />
                    <ShapeText text={area.text} shape={area} />
                  </React.Fragment>
                );
              case 'polygon':
                return (
                  <React.Fragment key={area.uuid}>
                    <Line
                      id={area.uuid}
                      points={area.points || []}
                      closed={true}
                      {...commonProps}
                    />
                    <ShapeText text={area.text} shape={area} />
                  </React.Fragment>
                );
              case 'text':
                return (
                  <Text
                    key={area.uuid}
                    id={area.uuid}
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
