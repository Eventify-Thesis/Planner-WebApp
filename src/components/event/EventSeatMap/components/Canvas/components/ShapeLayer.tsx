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
      // Get all selected shapes including the one being dragged
      const selectedShapes = seatingPlan.zones[0].areas.filter(
        (a) =>
          selection.selectedItems.areas.includes(a.uuid) || a.uuid === uuid,
      );
      if (selectedShapes.length === 0) return;

      // Store the initial positions and mouse offset for all selected shapes
      const mousePos = getMousePosition(e, zoom);
      if (!mousePos) return;

      // Find the shape being dragged to calculate offset
      const draggedShape = selectedShapes.find((s) => s.uuid === uuid);
      if (!draggedShape) return;

      // Calculate mouse offset from the dragged shape
      const mouseOffset = {
        x: mousePos.x - draggedShape.position.x,
        y: mousePos.y - draggedShape.position.y,
      };

      // Store initial positions of all selected shapes
      e.target.dragStartData = {
        selectedShapes: selectedShapes.map((shape) => ({
          uuid: shape.uuid,
          initialPos: { ...shape.position },
        })),
        mouseOffset,
      };
    };

    const handleDragEnd = (e: any, uuid: string) => {
      const mousePos = getMousePosition(e, zoom);
      if (!mousePos || !e.target.dragStartData) return;

      const { selectedShapes, mouseOffset } = e.target.dragStartData;

      // Calculate the movement delta
      const dx = mousePos.x - mouseOffset.x - selectedShapes[0].initialPos.x;
      const dy = mousePos.y - mouseOffset.y - selectedShapes[0].initialPos.y;

      const updatedPlan = { ...seatingPlan };
      updatedPlan.zones = updatedPlan.zones.map((z) => ({
        ...z,
        areas: z.areas.map((area) => {
          // Find if this area was in the selection
          const selectedShape = selectedShapes.find(
            (s) => s.uuid === area.uuid,
          );
          if (!selectedShape) return area;

          // Move the shape by the same delta from its initial position
          return {
            ...area,
            position: {
              x: selectedShape.initialPos.x + dx,
              y: selectedShape.initialPos.y + dy,
            },
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
                  <Rect
                    key={area.uuid}
                    id={area.uuid}
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
                    id={area.uuid}
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
                    id={area.uuid}
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
                    id={area.uuid}
                    points={area.points || []}
                    closed={true}
                    {...commonProps}
                  />
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
