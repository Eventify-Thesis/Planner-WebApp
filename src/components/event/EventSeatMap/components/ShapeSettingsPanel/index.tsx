import React from 'react';
import {
  Card,
  Stack,
  NumberInput,
  TextInput,
  ColorInput,
  Title,
  Divider,
} from '@mantine/core';
import { Shape } from '../../types/index';

interface ShapeSettingsPanelProps {
  shapes: Shape[];
  onUpdate: (shapes: Shape[]) => void;
}

const DEFAULT_SETTINGS = {
  TEXT: {
    color: '#000000',
    text: '',
    position: { x: 0, y: 0 },
    fontSize: 14,
  },
} as const;

const ShapeSettingsPanel: React.FC<ShapeSettingsPanelProps> = ({
  shapes,
  onUpdate,
}) => {
  const handleUpdate = (updates: Partial<Shape>) => {
    const updatedShapes = shapes.map((shape) => ({
      ...shape,
      ...updates,
      // Ensure text object exists with defaults and preserve individual shape's text properties
      text: {
        ...DEFAULT_SETTINGS.TEXT,
        ...(shape.text || {}), // Preserve existing text settings for each shape
        ...(updates.text || {}), // Apply new text updates
        // Preserve individual shape's text position if not explicitly updating position
        position: updates.text?.position || shape.text?.position || DEFAULT_SETTINGS.TEXT.position,
      },
    }));
    onUpdate(updatedShapes);
  };

  // Get common values across all shapes
  const getCommonValue = <K extends keyof Shape>(key: K): Shape[K] | null => {
    const value = shapes[0]?.[key];
    return shapes.every((shape) => shape[key] === value) ? value : null;
  };

  // Get common text values
  const getCommonTextValue = <K extends keyof Shape['text']>(
    key: K,
  ): Shape['text'][K] | null => {
    const value = shapes[0]?.text?.[key];
    return shapes.every((shape) => shape.text?.[key] === value) ? value : null;
  };

  // Don't show panel if no shapes selected
  if (shapes.length === 0) {
    return null;
  }

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Stack spacing="sm">
        <Title order={4}>Shape Settings</Title>
        <Divider />

        <NumberInput
          size="xs"
          label="Rotation"
          value={getCommonValue('rotation') ?? undefined}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({ rotation: value });
          }}
          min={0}
          max={360}
          step={15}
        />

        {getCommonValue('size') && (
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
        )}

        {getCommonValue('size') && (
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
        )}

        {getCommonValue('fill') !== undefined && (
          <ColorInput
            size="xs"
            label="Fill Color"
            value={getCommonValue('fill') ?? undefined}
            onChange={(value) => handleUpdate({ fill: value })}
            format="rgba"
            swatches={['#F44336', '#9C27B0', '#4CAF50', '#2196F3', '#8BC34A']}
          />
        )}

        {getCommonValue('stroke') !== undefined && (
          <ColorInput
            size="xs"
            label="Border Color"
            value={getCommonValue('stroke') ?? undefined}
            onChange={(value) => handleUpdate({ stroke: value })}
            format="rgba"
            swatches={['#000000', '#666666', '#999999', '#CCCCCC', '#FFFFFF']}
          />
        )}

        <NumberInput
          size="xs"
          label="Z-Index"
          value={getCommonValue('zIndex') ?? 0}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({ zIndex: value });
          }}
          min={0}
          step={1}
        />

        <Divider />
        <Title order={5}>Text Settings</Title>

        <TextInput
          size="xs"
          label="Text Content"
          value={getCommonTextValue('text') ?? ''}
          onChange={(e) =>
            handleUpdate({
              text: {
                text: e.target.value,
              },
            })
          }
          placeholder="Enter text..."
        />

        <NumberInput
          size="xs"
          label="Font Size"
          value={getCommonTextValue('fontSize') ?? DEFAULT_SETTINGS.TEXT.fontSize}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              text: {
                fontSize: value,
              },
            });
          }}
          min={8}
          max={72}
          step={1}
        />

        <NumberInput
          size="xs"
          label="Text X Position"
          value={getCommonTextValue('position')?.x ?? 0}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              text: {
                position: {
                  x: value,
                  y: shapes[0].text?.position?.y ?? 0,
                },
              },
            });
          }}
          step={1}
        />

        <NumberInput
          size="xs"
          label="Text Y Position"
          value={getCommonTextValue('position')?.y ?? 0}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              text: {
                position: {
                  x: shapes[0].text?.position?.x ?? 0,
                  y: value,
                },
              },
            });
          }}
          step={1}
        />

        <ColorInput
          size="xs"
          label="Text Color"
          value={getCommonTextValue('color') ?? DEFAULT_SETTINGS.TEXT.color}
          onChange={(value) =>
            handleUpdate({
              text: {
                color: value,
              },
            })
          }
          format="rgba"
          swatches={['#000000', '#666666', '#999999', '#CCCCCC', '#FFFFFF']}
        />
      </Stack>
    </Card>
  );
};

export default ShapeSettingsPanel;
