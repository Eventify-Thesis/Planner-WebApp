import React, { memo } from 'react';
import { Group, Rect, Circle, Line, Text, Layer, Ellipse } from 'react-konva';
import {
  SeatingPlan,
  Selection,
  EditorTool,
  Point,
  Section,
} from '../../../types/index';
import { getMousePosition } from '../utils/mouseUtils';
import { getSectionStyles } from '../utils/styleUtils';

export interface SectionLayerProps {
  seatingPlan: SeatingPlan;
  selection: Selection;
  currentTool: EditorTool;
  zoom: number;
  onSelect: (type: 'section', id: string, event?: any) => void;
  onPlanChange: (plan: SeatingPlan) => void;
}

interface SectionTextProps {
  text: {
    text: string;
    position?: Point;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    align?: string;
    verticalAlign?: string;
  };
  section: Section;
}

const SectionText = memo(({ text, section }: SectionTextProps) => {
  if (!text?.text) return null;

  let centerX = section.position.x;
  let centerY = section.position.y;

  // Calculate center based on shape type
  switch (section.type) {
    case 'rectangle':
      centerX += (section.size?.width || 0) / 2;
      centerY += (section.size?.height || 0) / 2;
      break;
    case 'circle':
      centerX = section.position.x;
      centerY = section.position.y;
      break;
    case 'ellipse':
      centerX = section.position.x;
      centerY = section.position.y;
      break;
    case 'polygon':
      if (section.points && section.points.length > 0) {
        // Calculate centroid for polygon
        const points = section.points;
        let sumX = 0;
        let sumY = 0;
        points.forEach((point) => {
          sumX += point.x;
          sumY += point.y;
        });
        centerX = sumX / points.length;
        centerY = sumY / points.length;
      }
      break;
  }

  // Use provided position or fallback to shape center
  const x = text.position?.x ?? centerX;
  const y = text.position?.y ?? centerY;

  return (
    <Text
      x={x}
      y={y}
      text={text.text}
      fill={text.color || '#000000'}
      fontSize={text.fontSize || 14}
      fontFamily={text.fontFamily || 'Arial'}
      align={text.align || 'center'}
      verticalAlign={text.verticalAlign || 'middle'}
      offsetX={
        text.align === 'left'
          ? 0
          : text.align === 'right'
          ? text.text.length * 7
          : text.text.length * 3.5
      }
      offsetY={
        text.verticalAlign === 'top'
          ? 0
          : text.verticalAlign === 'bottom'
          ? 14
          : 7
      }
      onDragMove={(e) => {
        // Update text position when dragged
        const stage = e.target.getStage();
        const position = {
          x: e.target.x(),
          y: e.target.y(),
        };
        text.position = position;
      }}
    />
  );
});

export const SectionLayer = memo(
  ({
    seatingPlan,
    selection,
    currentTool,
    zoom,
    onPlanChange,
    onSelect,
  }: SectionLayerProps) => {
    const handleDragStart = (e: any, uuid: string) => {
      const mousePos = getMousePosition(e, zoom);
      if (!mousePos) return;

      // Get the shape being dragged and all selected shapes
      const draggedShape = seatingPlan.zones[0].sections.find(
        (a) => a.uuid === uuid,
      );
      const selectedShapes = seatingPlan.zones[0].sections.filter((a) =>
        selection.selectedItems.sections.includes(a.uuid),
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
          initialTextPos: shape.text?.position
            ? { ...shape.text.position }
            : { ...shape.position },
          offset: {
            x: mousePos.x - shape.position.x,
            y: mousePos.y - shape.position.y,
          },
        })),
      };
    };

    const handleDragMove = (e: any, uuid: string) => {
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
        sections: z.sections.map((section) => {
          const shapeData = shapes.find((s) => s.uuid === section.uuid);
          if (!shapeData) return section;

          const newPosition = {
            x: shapeData.initialPos.x + dx,
            y: shapeData.initialPos.y + dy,
          };

          return {
            ...section,
            position: newPosition,
            text: section.text
              ? {
                  ...section.text,
                  position: {
                    x: shapeData.initialTextPos.x + dx,
                    y: shapeData.initialTextPos.y + dy,
                  },
                }
              : undefined,
          };
        }),
      }));

      onPlanChange(updatedPlan);
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
        sections: z.sections.map((section) => {
          const shapeData = shapes.find((s) => s.uuid === section.uuid);
          if (!shapeData) return section;

          const newPosition = {
            x: shapeData.initialPos.x + dx,
            y: shapeData.initialPos.y + dy,
          };

          return {
            ...section,
            position: newPosition,
            text: section.text
              ? {
                  ...section.text,
                  position: {
                    x: shapeData.initialTextPos.x + dx,
                    y: shapeData.initialTextPos.y + dy,
                  },
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
          zone.sections.map((section) => {
            const isSelected =
              selection.selectedItems?.sections &&
              selection.selectedItems.sections.length > 0 &&
              selection.selectedItems.sections.includes(section.uuid);
            const commonProps = {
              draggable: currentTool === EditorTool.SELECT_SECTION,
              onClick: (e: any) => onSelect('section', section.uuid, e),
              onDragStart: (e: any) => handleDragStart(e, section.uuid),
              onDragMove: (e: any) => handleDragMove(e, section.uuid),
              onDragEnd: (e: any) => handleDragEnd(e, section.uuid),
              onMouseEnter: (e: any) => {
                if (currentTool === EditorTool.SELECT_SECTION) {
                  e.target.getStage()!.container().style.cursor = 'pointer';
                }
              },
              onMouseLeave: (e: any) => {
                e.target.getStage()!.container().style.cursor = 'default';
              },
              ...getSectionStyles(section, isSelected, seatingPlan.categories),
            };

            // Render based on section type
            switch (section.type) {
              case 'rectangle':
                return (
                  <Group key={section.uuid}>
                    <Rect
                      width={section.size.width}
                      height={section.size.height}
                      cornerRadius={section.cornerRadius || 4}
                      x={section.position.x}
                      y={section.position.y}
                      {...commonProps}
                    />
                    <SectionText text={section.text} section={section} />
                  </Group>
                );

              case 'circle':
                return (
                  <Group key={section.uuid}>
                    <Circle
                      {...commonProps}
                      id={section.uuid}
                      x={section.position.x}
                      y={section.position.y}
                      radius={section.radius || 0}
                    />
                    <SectionText text={section.text} section={section} />
                  </Group>
                );
              case 'ellipse':
                return (
                  <Group key={section.uuid}>
                    <Ellipse
                      {...commonProps}
                      id={section.uuid}
                      x={section.position.x}
                      y={section.position.y}
                      radiusX={section.size?.width ? section.size.width / 2 : 0}
                      radiusY={
                        section.size?.height ? section.size.height / 2 : 0
                      }
                    />
                    <SectionText text={section.text} section={section} />
                  </Group>
                );

              case 'polygon':
                if (!section.points || section.points.length < 3) return null;
                const flatPoints = section.points.flatMap((p: Point) => [
                  p.x - (section.position?.x || 0),
                  p.y - (section.position?.y || 0),
                ]);
                return (
                  <Group key={section.uuid}>
                    <Line {...commonProps} points={flatPoints} closed={true} />
                    {section.label && (
                      <Text
                        x={10}
                        y={10}
                        text={section.label}
                        fontSize={section.textSize || 16}
                        fill={section.textColor || '#333333'}
                        fontStyle="bold"
                      />
                    )}
                  </Group>
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

SectionLayer.displayName = 'SectionLayer';
