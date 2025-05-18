import React from 'react';
import {
  Card,
  NumberInput,
  TextInput,
  Select,
  ColorInput,
  Stack,
  Title,
  Divider,
} from '@mantine/core';
import { Section, Category } from '../../types';

interface SectionSettingsPanelProps {
  sections: Section[];
  categories: Category[];
  onUpdate: (updatedSections: Section[]) => void;
}

const DEFAULT_SETTINGS = {
  TEXT: {
    text: '',
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Arial',
    align: 'center',
    verticalAlign: 'middle',
    rotation: 0,
  },
} as const;

const SectionSettingsPanel: React.FC<SectionSettingsPanelProps> = ({
  sections,
  categories,
  onUpdate,
}) => {
  console.log('Red');
  // Get common values across all sections
  const getCommonValue = <K extends keyof Section>(
    key: K,
  ): Section[K] | null => {
    const value = sections[0]?.[key];
    return sections.every((section) => section[key] === value) ? value : null;
  };

  // Get common text values
  const getCommonTextValue = <K extends keyof Section['text']>(
    key: K,
  ): Section['text'][K] | null => {
    const value = sections[0]?.text?.[key];
    return sections.every((section) => section.text?.[key] === value)
      ? value
      : null;
  };

  const handleUpdate = (updates: Partial<Section>) => {
    const updatedSections = sections.map((section) => ({
      ...section,
      ...updates,
      // Ensure text object exists with defaults and preserve individual section's text properties
      text: updates.text
        ? {
            ...section.text,
            ...updates.text,
          }
        : section.text,
    }));
    onUpdate(updatedSections);
  };

  // Don't show panel if no sections selected
  if (sections.length === 0) {
    return null;
  }

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Stack spacing="sm">
        <Title order={4}>Section Settings</Title>
        <Divider />

        <TextInput
          size="xs"
          label="Section ID"
          value={getCommonValue('uuid') ?? ''}
          readOnly
        />

        <TextInput
          size="xs"
          label="Section Name"
          value={getCommonValue('name') ?? ''}
          onChange={(e) => {
            handleUpdate({
              name: e.target.value,
            });
          }}
          placeholder="Enter section name..."
        />

        <NumberInput
          size="xs"
          label="Quantity"
          value={getCommonValue('quantity') ?? 1}
          onChange={(value: string | number) => {
            if (value === '') return;
            handleUpdate({ quantity: value });
          }}
          min={1}
          step={1}
        />

        <Select
          size="xs"
          label="Type"
          value={getCommonValue('type') ?? undefined}
          data={[
            { value: 'rectangle', label: 'Rectangle' },
            { value: 'circle', label: 'Circle' },
            { value: 'polygon', label: 'Polygon' },
            { value: 'ellipse', label: 'Ellipse' },
          ]}
          disabled
        />

        <Select
          size="xs"
          label="Category"
          value={getCommonValue('category') ?? undefined}
          onChange={(value) => handleUpdate({ category: value || undefined })}
          data={categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
          }))}
          clearable
        />

        <NumberInput
          size="xs"
          label="Rotation (degrees)"
          value={getCommonValue('rotation') ?? 0}
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
                  ...sections[0].size,
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
                  ...sections[0].size,
                  height: value,
                },
              });
            }}
            min={1}
            step={10}
          />
        )}

        {getCommonValue('radius') !== undefined && (
          <NumberInput
            size="xs"
            label="Radius"
            value={getCommonValue('radius') ?? undefined}
            onChange={(value: number | '') => {
              if (value === '') return;
              handleUpdate({ radius: value });
            }}
            min={1}
            step={5}
          />
        )}

        {getCommonValue('cornerRadius') !== undefined && (
          <NumberInput
            size="xs"
            label="Corner Radius"
            value={getCommonValue('cornerRadius') ?? 0}
            onChange={(value: number | '') => {
              if (value === '') return;
              handleUpdate({ cornerRadius: value });
            }}
            min={0}
            max={50}
            step={1}
          />
        )}

        <ColorInput
          size="xs"
          label="Fill Color"
          value={getCommonValue('fill') ?? 'rgba(200, 230, 255, 0.6)'}
          onChange={(value) => handleUpdate({ fill: value })}
          format="rgba"
          swatches={['#F44336', '#9C27B0', '#4CAF50', '#2196F3', '#8BC34A']}
        />

        <ColorInput
          size="xs"
          label="Border Color"
          value={getCommonValue('stroke') ?? '#3366CC'}
          onChange={(value) => handleUpdate({ stroke: value })}
          format="rgba"
          swatches={['#000000', '#3366CC', '#666666', '#999999', '#CCCCCC']}
        />

        <NumberInput
          size="xs"
          label="Border Width"
          value={getCommonValue('strokeWidth') ?? 2}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({ strokeWidth: value });
          }}
          min={0}
          max={10}
          step={1}
        />

        {/* Text Settings */}
        <Divider />
        <Title order={5}>Text Settings</Title>

        <TextInput
          size="xs"
          label="Text Content"
          value={getCommonTextValue('text') ?? ''}
          onChange={(e) =>
            handleUpdate({
              text: {
                ...sections[0].text,
                text: e.target.value,
              },
            })
          }
          placeholder="Enter text..."
        />

        <NumberInput
          size="xs"
          label="Font Size"
          value={
            getCommonTextValue('fontSize') ?? DEFAULT_SETTINGS.TEXT.fontSize
          }
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              text: {
                ...sections[0].text,
                fontSize: value,
              },
            });
          }}
          min={8}
          max={72}
          step={1}
        />

        <Select
          size="xs"
          label="Font Family"
          value={
            getCommonTextValue('fontFamily') ?? DEFAULT_SETTINGS.TEXT.fontFamily
          }
          onChange={(value) =>
            handleUpdate({
              text: {
                ...sections[0].text,
                fontFamily: value || DEFAULT_SETTINGS.TEXT.fontFamily,
              },
            })
          }
          data={[
            { value: 'Arial', label: 'Arial' },
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Courier New', label: 'Courier New' },
            { value: 'Georgia', label: 'Georgia' },
            { value: 'Verdana', label: 'Verdana' },
          ]}
        />

        <ColorInput
          size="xs"
          label="Text Color"
          value={getCommonTextValue('color') ?? DEFAULT_SETTINGS.TEXT.color}
          onChange={(value) =>
            handleUpdate({
              text: {
                ...sections[0].text,
                color: value,
              },
            })
          }
          format="rgba"
          swatches={['#000000', '#FFFFFF', '#3366CC', '#666666', '#999999']}
        />

        <Select
          size="xs"
          label="Text Alignment"
          value={getCommonTextValue('align') ?? DEFAULT_SETTINGS.TEXT.align}
          onChange={(value) =>
            handleUpdate({
              text: {
                ...sections[0].text,
                align: value || DEFAULT_SETTINGS.TEXT.align,
              },
            })
          }
          data={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />

        <Select
          size="xs"
          label="Vertical Alignment"
          value={
            getCommonTextValue('verticalAlign') ??
            DEFAULT_SETTINGS.TEXT.verticalAlign
          }
          onChange={(value) =>
            handleUpdate({
              text: {
                ...sections[0].text,
                verticalAlign: value || DEFAULT_SETTINGS.TEXT.verticalAlign,
              },
            })
          }
          data={[
            { value: 'top', label: 'Top' },
            { value: 'middle', label: 'Middle' },
            { value: 'bottom', label: 'Bottom' },
          ]}
        />

        {sections[0].text?.position && (
          <>
            <NumberInput
              size="xs"
              label="Text X Position"
              value={getCommonTextValue('position')?.x ?? 0}
              onChange={(value: number | '') => {
                if (value === '') return;
                handleUpdate({
                  text: {
                    ...sections[0].text,
                    position: {
                      ...sections[0].text.position,
                      x: value,
                    },
                  },
                });
              }}
              step={5}
            />

            <NumberInput
              size="xs"
              label="Text Y Position"
              value={getCommonTextValue('position')?.y ?? 0}
              onChange={(value: number | '') => {
                if (value === '') return;
                handleUpdate({
                  text: {
                    ...sections[0].text,
                    position: {
                      ...sections[0].text.position,
                      y: value,
                    },
                  },
                });
              }}
              step={5}
            />
          </>
        )}
      </Stack>
    </Card>
  );
};

export default SectionSettingsPanel;
