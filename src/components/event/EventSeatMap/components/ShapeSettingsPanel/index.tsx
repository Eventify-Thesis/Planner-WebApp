import React from 'react';
import { Card, Stack, NumberInput, TextInput, ColorInput, Title } from '@mantine/core';
import { Shape } from '../../types';

interface ShapeSettingsPanelProps {
  shapes: Shape[];
  onUpdate: (updatedShapes: Shape[]) => void;
}

const DEFAULT_SETTINGS = {
  TEXT: {
    color: '#000000',
    text: '',
    position: { x: 0, y: 0 }
  }
} as const;

const ShapeSettingsPanel: React.FC<ShapeSettingsPanelProps> = ({
  shapes,
  onUpdate,
}) => {
  const handleUpdate = (updates: Partial<Shape>) => {
    const updatedShapes = shapes.map(shape => ({
      ...shape,
      ...updates,
      // Ensure text object exists with defaults
      text: {
        ...DEFAULT_SETTINGS.TEXT,
        ...(shape.text || {}),
        ...(updates.text || {})
      }
    }));
    onUpdate(updatedShapes);
  };

  // Get common values across all shapes
  const getCommonValue = <K extends keyof Shape>(key: K): Shape[K] | null => {
    const value = shapes[0]?.[key];
    return shapes.every(shape => shape[key] === value) ? value : null;
  };

  // Get common text values
  const getCommonTextValue = <K extends keyof Shape['text']>(key: K): Shape['text'][K] | null => {
    const value = shapes[0]?.text?.[key];
    return shapes.every(shape => shape.text?.[key] === value) ? value : null;
  };

  // Don't show panel if no shapes selected
  if (shapes.length === 0) return null;

  return (
    <Card shadow="sm" p="xs">
      <Stack spacing="xs">
        <Card.Section p="xs">
          <Title order={4}>Shape Settings</Title>
        </Card.Section>

        <NumberInput
          size="xs"
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
          size="xs"
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
          size="xs"
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
          size="xs"
          label="Fill Color"
          value={getCommonValue('fill') ?? undefined}
          onChange={(value) => handleUpdate({ fill: value })}
          format="rgba"
          swatches={['#F44336', '#9C27B0', '#4CAF50', '#2196F3', '#8BC34A']}
        />

        <ColorInput
          size="xs"
          label="Border Color"
          value={getCommonValue('stroke') ?? undefined}
          onChange={(value) => handleUpdate({ stroke: value })}
          format="rgba"
          swatches={['#000000', '#666666', '#999999', '#CCCCCC', '#FFFFFF']}
        />

        <Card.Section p="xs">
          <Title order={5}>Text Settings</Title>
        </Card.Section>

        <TextInput
          size="xs"
          label="Text Content"
          value={getCommonTextValue('text') ?? ''}
          onChange={(e) => handleUpdate({ 
            text: { 
              ...shapes[0].text,
              text: e.target.value 
            }
          })}
          placeholder="Enter text..."
        />

        <NumberInput
          size="xs"
          label="Text Position X"
          value={getCommonTextValue('position')?.x ?? undefined}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              text: {
                ...shapes[0].text,
                position: {
                  ...shapes[0].text.position,
                  x: value,
                }
              }
            });
          }}
          step={1}
        />

        <NumberInput
          size="xs"
          label="Text Position Y"
          value={getCommonTextValue('position')?.y ?? undefined}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              text: {
                ...shapes[0].text,
                position: {
                  ...shapes[0].text.position,
                  y: value,
                }
              }
            });
          }}
          step={1}
        />

        <ColorInput
          size="xs"
          label="Text Color"
          value={getCommonTextValue('color') ?? undefined}
          onChange={(value) => handleUpdate({ 
            text: {
              ...shapes[0].text,
              color: value
            }
          })}
          format="rgba"
          swatches={['#000000', '#666666', '#999999', '#CCCCCC', '#FFFFFF']}
        />
      </Stack>
    </Card>
  );
};

export default ShapeSettingsPanel;