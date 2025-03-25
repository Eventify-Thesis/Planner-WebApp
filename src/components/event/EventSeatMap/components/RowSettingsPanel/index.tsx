import React, { useEffect } from 'react';
import {
  Card,
  NumberInput,
  TextInput,
  Select,
  Stack,
  Title,
  ColorInput,
} from '@mantine/core';
import { Row, Category, Point } from '../../types';

interface RowSettingsPanelProps {
  rows: Row[];
  categories: Category[];
  onUpdate: (updatedRows: Row[]) => void;
}

// Default values for row settings
const DEFAULT_SETTINGS = {
  SEAT_SPACING: 35,
  SEAT_RADIUS: 15,
  START_NUMBER: 1,
  NUMBER_FORMAT: '{row}-{number}',
} as const;

const recalculateSeatPositions = (
  seats: Row['seats'],
  spacing: number,
): Row['seats'] => {
  if (seats.length < 2) return seats;

  // Get first and last seat to determine direction
  const firstSeat = seats[0];
  const lastSeat = seats[seats.length - 1];

  // Calculate direction vector
  const dx = lastSeat.position.x - firstSeat.position.x;
  const dy = lastSeat.position.y - firstSeat.position.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vector
  const dirX = dx / length;
  const dirY = dy / length;

  // Update positions keeping first seat as anchor
  return seats.map((seat, index) => ({
    ...seat,
    position: {
      x: firstSeat.position.x + dirX * spacing * index,
      y: firstSeat.position.y + dirY * spacing * index,
    },
  }));
};

const getCommonValue = <K extends keyof Row>(
  key: K,
  rows: Row[],
): Row[K] | null => {
  const value = rows[0]?.[key];
  return rows.every((row) => row[key] === value) ? value : null;
};

const RowSettingsPanel: React.FC<RowSettingsPanelProps> = ({
  rows,
  categories,
  onUpdate,
}) => {
  const handleUpdate = (updates: Partial<Row>) => {
    const updatedRows = rows.map((row) => ({
      ...row,
      ...updates,
    }));

    // Update seat positions and properties
    if (updates.seatSpacing) {
      updatedRows.forEach((row) => {
        row.seats = recalculateSeatPositions(row.seats, updates.seatSpacing);
      });
    }

    // Update seat radius if changed
    if (updates.seatRadius) {
      updatedRows.forEach((row) => {
        row.seats = row.seats.map((seat) => ({
          ...seat,
          radius: updates.seatRadius,
        }));
      });
    }

    // Update seat numbers if start number or numbering type changed
    if (updates.startNumber !== undefined || updates.numberingType) {
      const startNum =
        updates.startNumber ??
        rows[0].startNumber ??
        DEFAULT_SETTINGS.START_NUMBER;
      updatedRows.forEach((row) => {
        row.seats = row.seats.map((seat, index) => ({
          ...seat,
          number: startNum + index,
        }));
      });
    }

    // Update seat categories if default category changed
    if (updates.defaultCategory !== undefined) {
      updatedRows.forEach((row) => {
        row.seats = row.seats.map((seat) => ({
          ...seat,
          category: updates.defaultCategory,
        }));
      });
    }

    onUpdate(updatedRows);
  };

  // Set default values when component mounts or row changes
  useEffect(() => {
    const updates: Partial<Row> = {};
    let hasUpdates = false;

    if (!rows[0].label) {
      updates.label = `Row ${rows[0].rowNumber}`;
      hasUpdates = true;
    }

    if (!rows[0].seatSpacing) {
      updates.seatSpacing = DEFAULT_SETTINGS.SEAT_SPACING;
      hasUpdates = true;
    }

    if (!rows[0].seatRadius) {
      updates.seatRadius = DEFAULT_SETTINGS.SEAT_RADIUS;
      hasUpdates = true;
    }

    if (rows[0].startNumber === undefined) {
      updates.startNumber = DEFAULT_SETTINGS.START_NUMBER;
      hasUpdates = true;
    }

    if (!rows[0].numberFormat) {
      updates.numberFormat = DEFAULT_SETTINGS.NUMBER_FORMAT;
      hasUpdates = true;
    }

    if (!rows[0].numberingType) {
      updates.numberingType = 'continuous';
      hasUpdates = true;
    }

    if (hasUpdates) {
      handleUpdate(updates);
    }
  }, [rows[0].rowNumber]);

  // Don't show panel if no rows selected
  if (rows.length === 0) return null;

  return (
    <Card shadow="sm" p="xs">
      <Stack spacing="xs">
        <Card.Section p="xs">
          <Title order={4}>Row Settings</Title>
        </Card.Section>

        <NumberInput
          size="xs"
          label="Row Number"
          value={getCommonValue('rowNumber', rows)}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({
              rowNumber: value,
              label: `Row ${value}`,
            });
          }}
          min={0}
        />

        <TextInput
          size="xs"
          label="Row Label"
          value={getCommonValue('label', rows) || ''}
          placeholder={`Row ${getCommonValue('rowNumber', rows)}`}
          onChange={(e) => handleUpdate({ label: e.target.value })}
        />

        <NumberInput
          size="xs"
          label="Seat Spacing"
          description="Distance between seats (pixels)"
          value={
            getCommonValue('seatSpacing', rows) || DEFAULT_SETTINGS.SEAT_SPACING
          }
          placeholder={DEFAULT_SETTINGS.SEAT_SPACING.toString()}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({ seatSpacing: value });
          }}
          min={20}
          step={5}
        />

        <NumberInput
          size="xs"
          label="Seat Radius"
          description="Size of each seat (pixels)"
          value={
            getCommonValue('seatRadius', rows) || DEFAULT_SETTINGS.SEAT_RADIUS
          }
          placeholder={DEFAULT_SETTINGS.SEAT_RADIUS.toString()}
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({ seatRadius: value });
          }}
          min={10}
          max={50}
          step={2}
        />

        <Select
          size="xs"
          label="Default Category"
          value={getCommonValue('defaultCategory', rows)}
          onChange={(value) =>
            handleUpdate({ defaultCategory: value || undefined })
          }
          data={categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
          }))}
          clearable
          placeholder="Select a category"
        />
        {/* 
        <Select
          size="xs"
          label="Numbering Type"
          value={getCommonValue('numberingType', rows) || 'continuous'}
          onChange={(value) => 
            handleUpdate({ 
              numberingType: value as 'continuous' | 'perRow',
            })
          }
          data={[
            { value: 'continuous', label: 'Continuous' },
            { value: 'perRow', label: 'Per Row' },
          ]}
        /> */}

        <NumberInput
          size="xs"
          label="Start Number"
          description="First seat number in the row"
          value={
            getCommonValue('startNumber', rows) || DEFAULT_SETTINGS.START_NUMBER
          }
          onChange={(value: number | '') => {
            if (value === '') return;
            handleUpdate({ startNumber: value });
          }}
          min={0}
          step={1}
        />

        {/* <TextInput
          size="xs"
          label="Number Format"
          description="Use {row} and {number} as placeholders"
          value={getCommonValue('numberFormat', rows) || DEFAULT_SETTINGS.NUMBER_FORMAT}
          placeholder={DEFAULT_SETTINGS.NUMBER_FORMAT}
          onChange={(e) => handleUpdate({ numberFormat: e.target.value })}
        /> */}
      </Stack>
    </Card>
  );
};

export default RowSettingsPanel;
