import React from 'react';
import { Layer, Rect, Group, Text } from 'react-konva';
import { SeatingPlan, Section, Selection, EditorTool } from '../../../../types';

interface SectionLayerProps {
  seatingPlan: SeatingPlan;
  selection: Selection;
  currentTool: EditorTool;
  onSelect: (item: any) => void;
  onDragStart: (id: string, type: 'seat' | 'row' | 'shape' | 'section') => void;
  onDragEnd: (e: any, type: 'seat' | 'row' | 'shape' | 'section') => void;
}

const SectionLayer: React.FC<SectionLayerProps> = ({
  seatingPlan,
  selection,
  currentTool,
  onSelect,
  onDragStart,
  onDragEnd,
}) => {
  const renderSection = (section: Section, zoneIndex: number) => {
    const isSelected = selection.selectedItems.sections.some(
      (s) => s.uuid === section.uuid
    );

    // Determine section appearance based on its properties
    const fill = section.fill || 'rgba(200, 230, 255, 0.6)';
    const stroke = section.stroke || '#3366CC';
    const strokeWidth = section.strokeWidth || 2;
    
    return (
      <Group
        key={section.uuid}
        id={section.uuid}
        x={section.position.x}
        y={section.position.y}
        width={section.size.width}
        height={section.size.height}
        rotation={section.rotation || 0}
        draggable={currentTool === EditorTool.SELECT_SEAT || currentTool === EditorTool.SELECT_SECTION}
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect({
            type: 'section',
            section,
            zoneIndex,
          });
        }}
        onDragStart={(e) => {
          e.cancelBubble = true;
          onDragStart(section.uuid, 'section');
        }}
        onDragEnd={(e) => {
          e.cancelBubble = true;
          onDragEnd(e, 'section');
        }}
      >
        <Rect
          width={section.size.width}
          height={section.size.height}
          fill={fill}
          stroke={isSelected ? '#FF5555' : stroke}
          strokeWidth={isSelected ? 3 : strokeWidth}
          cornerRadius={section.cornerRadius || 0}
          perfectDrawEnabled={false}
        />
        {section.label && (
          <Text
            text={section.label}
            width={section.size.width}
            height={section.size.height}
            align="center"
            verticalAlign="middle"
            fontSize={section.textSize || 14}
            fontFamily={section.textFont || 'Arial'}
            fill={section.textColor || '#000000'}
            perfectDrawEnabled={false}
          />
        )}
      </Group>
    );
  };

  return (
    <Layer>
      {seatingPlan.zones.map((zone, zoneIndex) => (
        <React.Fragment key={`zone-${zoneIndex}`}>
          {zone.sections && zone.sections.map((section) => 
            renderSection(section, zoneIndex)
          )}
        </React.Fragment>
      ))}
    </Layer>
  );
};

export default SectionLayer;
