import React from 'react';
import { Card, NumberInput, TextInput, Select } from '@mantine/core';
import { Row, Category } from '../../types';

interface RowSettingsPanelProps {
  row: Row;
  categories: Category[];
  onUpdate: (updatedRow: Row) => void;
}

const RowSettingsPanel: React.FC<RowSettingsPanelProps> = ({
  row,
  categories,
  onUpdate,
}) => {
  const handleUpdate = (updates: Partial<Row>) => {
    onUpdate({ ...row, ...updates });
  };

  return (
    <Card shadow="sm" p="md">
      <Card.Section p="md">
        <h3>Row Settings</h3>
      </Card.Section>

      <NumberInput
        label="Row Number"
        value={row.rowNumber}
        onChange={(value) => handleUpdate({ rowNumber: value || 0 })}
        min={0}
        mb="sm"
      />

      <TextInput
        label="Row Label"
        value={row.label || ''}
        onChange={(e) => handleUpdate({ label: e.target.value })}
        mb="sm"
      />

      <NumberInput
        label="Seat Spacing"
        value={row.seatSpacing}
        onChange={(value) => handleUpdate({ seatSpacing: value || 0 })}
        min={1}
        mb="sm"
      />

      <NumberInput
        label="Seat Radius"
        value={row.seatRadius}
        onChange={(value) => handleUpdate({ seatRadius: value || 0 })}
        min={1}
        mb="sm"
      />

      <Select
        label="Default Category"
        value={row.defaultCategory}
        onChange={(value) => handleUpdate({ defaultCategory: value || undefined })}
        data={categories.map((cat) => ({
          value: cat.name,
          label: cat.name,
        }))}
        clearable
        mb="sm"
      />

      <Select
        label="Numbering Type"
        value={row.numberingType}
        onChange={(value) => handleUpdate({ numberingType: value as 'continuous' | 'perRow' })}
        data={[
          { value: 'continuous', label: 'Continuous' },
          { value: 'perRow', label: 'Per Row' },
        ]}
        mb="sm"
      />

      <NumberInput
        label="Start Number"
        value={row.startNumber}
        onChange={(value) => handleUpdate({ startNumber: value || 0 })}
        min={0}
        mb="sm"
      />

      <TextInput
        label="Number Format"
        value={row.numberFormat}
        onChange={(e) => handleUpdate({ numberFormat: e.target.value })}
        placeholder="e.g., {row}{number}"
        mb="sm"
      />
    </Card>
  );
};

export default RowSettingsPanel;
