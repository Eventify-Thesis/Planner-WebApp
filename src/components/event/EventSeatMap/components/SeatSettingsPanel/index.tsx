import React from 'react';
import { Card, NumberInput, TextInput, Select } from '@mantine/core';
import { Seat, Category } from '../../types';

interface SeatSettingsPanelProps {
  seat: Seat;
  categories: Category[];
  onUpdate: (updatedSeat: Seat) => void;
}

const SeatSettingsPanel: React.FC<SeatSettingsPanelProps> = ({
  seat,
  categories,
  onUpdate,
}) => {
  const handleUpdate = (updates: Partial<Seat>) => {
    onUpdate({ ...seat, ...updates });
  };

  return (
    <Card shadow="sm" p="md">
      <Card.Section p="md">
        <h3>Seat Settings</h3>
      </Card.Section>

      <NumberInput
        label="Seat Number"
        value={seat.number}
        onChange={(value) => handleUpdate({ number: value || 0 })}
        min={0}
        mb="sm"
      />

      <TextInput
        label="Seat ID"
        value={seat.uuid}
        readOnly
        mb="sm"
      />

      <NumberInput
        label="Radius"
        value={seat.radius}
        onChange={(value) => handleUpdate({ radius: value || 0 })}
        min={1}
        mb="sm"
      />

      <Select
        label="Category"
        value={seat.category}
        onChange={(value) => handleUpdate({ category: value || undefined })}
        data={categories.map((cat) => ({
          value: cat.name,
          label: cat.name,
        }))}
        clearable
        mb="sm"
      />
    </Card>
  );
};

export default SeatSettingsPanel;
