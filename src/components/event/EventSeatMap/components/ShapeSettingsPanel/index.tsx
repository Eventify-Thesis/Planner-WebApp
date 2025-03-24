import React from 'react';
import { Card, Stack, NumberInput, TextInput, ColorInput } from '@mantine/core';
import { Shape } from '../../types';

interface ShapeSettingsPanelProps {
  shapes: Shape[];
  onUpdate: (updatedShapes: Shape[]) => void;
}

const DEFAULT_SETTINGS = {
  TEXT_SIZE: 14,
} as const;

const ShapeSettingsPanel: React.FC<ShapeSettingsPanelProps> = ({
  shapes,
  onUpdate,
}) => {
  const handleUpdate = (updates: Partial<Shape>) => {
    const updatedShapes = shapes.map(shape => ({
      ...shape,
      ...updates,
    }));
    onUpdate(updatedShapes);
  };

  // Get common values across all shapes
  const getCommonValue = <K extends keyof Shape>(key: K): Shape[K] | null => {
    const value = shapes[0]?.[key];
    return shapes.every(shape => shape[key] === value) ? value : null;
  };

  // Don't show panel if no shapes selected
  if (shapes.length === 0) return null;

  return (
    <Card shadow="sm" p="md">
      <Stack spacing="sm">
        <Card.Section p="md">
          <h3>Shape Settings</h3>
        </Card.Section>

        <NumberInput
          label="Rotation (degrees)"
          value={getCommonValue('rotation') ?? undefined}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({ rotation: value });
          }}
          min={0}
          max={360}
          step={15}
        />

        <NumberInput
          label="Width"
          value={getCommonValue('size')?.width ?? undefined}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              size: {
                ...shapes[0].size,
                width: value,
              },
            });
          }}
          min={1}
          step={10}
        />

        <NumberInput
          label="Height"
          value={getCommonValue('size')?.height ?? undefined}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              size: {
                ...shapes[0].size,
                height: value,
              },
            });
          }}
          min={1}
          step={10}
        />

        <ColorInput
          label="Fill Color"
          value={getCommonValue('fill') ?? undefined}
          onChange={(value) => handleUpdate({ fill: value })}
          format="rgba"
          swatches={['#F44336', '#9C27B0', '#4CAF50', '#2196F3', '#8BC34A']}
        />

        <ColorInput
          label="Border Color"
          value={getCommonValue('stroke') ?? undefined}
          onChange={(value) => handleUpdate({ stroke: value })}
          format="rgba"
          swatches={['#000000', '#666666', '#999999', '#CCCCCC', '#FFFFFF']}
        />

        {/* Text settings - only show if all selected shapes have text */}
        {shapes.every(shape => shape.type === 'text') && (
          <>
            <TextInput
              label="Text Content"
              value={getCommonValue('text') ?? ''}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              placeholder="Enter text..."
            />

            <NumberInput
              label="Text Size"
              value={getCommonValue('textSize') ?? DEFAULT_SETTINGS.TEXT_SIZE}
              onChange={(value: number | '') => {
                if (value === '') return;
                handleUpdate({ textSize: value });
              }}
              min={8}
              max={72}
              step={1}
            />

            <NumberInput
              label="Text Position X"
              value={getCommonValue('textPosition')?.x ?? undefined}
              onChange={(value: number | '') => {
                if (value === '') return;
                handleUpdate({
                  textPosition: {
                    ...shapes[0].textPosition,
                    x: value,
                  },
                });
              }}
              step={1}
            />

            <NumberInput
              label="Text Position Y"
              value={getCommonValue('textPosition')?.y ?? undefined}
              onChange={(value: number | '') => {
                if (value === '') return;
                handleUpdate({
                  textPosition: {
                    ...shapes[0].textPosition,
                    y: value,
                  },
                });
              }}
              step={1}
            />

            <ColorInput
              label="Text Color"
              value={getCommonValue('textColor') ?? undefined}
              onChange={(value) => handleUpdate({ textColor: value })}
              format="rgba"
              swatches={['#000000', '#666666', '#999999', '#CCCCCC', '#FFFFFF']}
            />
          </>
        )}
      </Stack>
    </Card>
  );
};

export default ShapeSettingsPanel;