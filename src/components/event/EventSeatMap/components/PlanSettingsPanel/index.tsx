import React, { useState } from 'react';
import {
  Card,
  TextInput,
  NumberInput,
  Button,
  ColorInput,
  Text,
  Group,
  Stack,
  FileInput,
  Accordion,
  Badge,
  Title,
} from '@mantine/core';
import { SeatingPlan, Category } from '../../types/index';
import './PlanSettingsPanel.css';

interface PlanSettingsPanelProps {
  seatingPlan: SeatingPlan;
  onUpdate: (plan: SeatingPlan) => void;
}

const PlanSettingsPanel: React.FC<PlanSettingsPanelProps> = ({
  seatingPlan,
  onUpdate,
}) => {
  const [newCategory, setNewCategory] = useState<Partial<Category>>({});

  const handleUpdate = (updates: Partial<SeatingPlan>) => {
    const updatedPlan = { ...seatingPlan, ...updates };

    // Calculate total seats and update category seat counts
    const categoryCounts: { [key: string]: number } = {};
    let totalSeats = 0;

    updatedPlan.zones.forEach((zone) => {
      zone.rows.forEach((row) => {
        totalSeats += row.seats.length;
        row.seats.forEach((seat) => {
          if (seat.category) {
            categoryCounts[seat.category] =
              (categoryCounts[seat.category] || 0) + 1;
          }
        });
      });
    });

    // Update category seat counts
    updatedPlan.categories = updatedPlan.categories.map((category) => ({
      ...category,
      seatCount: categoryCounts[category.name] || 0,
    }));

    // Update total seats
    updatedPlan.totalSeats = totalSeats;

    onUpdate(updatedPlan);
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;

    const updatedPlan = { ...seatingPlan };
    updatedPlan.categories = [
      ...updatedPlan.categories,
      { ...newCategory, seatCount: 0 } as Category,
    ];
    onUpdate(updatedPlan);
    setNewCategory({});
  };

  const handleUpdateCategory = (index: number, updates: Partial<Category>) => {
    const updatedPlan = { ...seatingPlan };
    updatedPlan.categories[index] = {
      ...updatedPlan.categories[index],
      ...updates,
    };
    onUpdate(updatedPlan);
  };

  const handleDeleteCategory = (index: number) => {
    const updatedPlan = { ...seatingPlan };
    updatedPlan.categories.splice(index, 1);
    onUpdate(updatedPlan);
  };

  const handleBackgroundImage = (file: File | null) => {
    if (!file) {
      handleUpdate({ backgroundImage: undefined });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleUpdate({ backgroundImage: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = () => {
    handleUpdate({ backgroundImage: undefined });
  };

  return (
    <Card shadow="sm" p="xs">
      <Stack spacing="xs">
        <Card.Section p="xs">
          <Title order={4}>Plan Settings</Title>
        </Card.Section>

        <TextInput
          label="Plan Name"
          value={seatingPlan.name}
          onChange={(e) => handleUpdate({ name: e.target.value })}
          mb="xs"
        />

        <Group grow mb="xs">
          <NumberInput
            size="xs"
            label="Width"
            value={seatingPlan.size.width}
            onChange={(value: '' | number) => {
              if (value === '') return;
              handleUpdate({
                size: { ...seatingPlan.size, width: value },
              });
            }}
            min={100}
            step={10}
          />
          <NumberInput
            size="xs"
            label="Height"
            value={seatingPlan.size.height}
            onChange={(value: number | '') => {
              if (value === '') return;
              handleUpdate({
                size: { ...seatingPlan.size, height: value },
              });
            }}
            min={100}
            step={10}
          />
        </Group>

        <Text size="xs" mb="xs">
          Total Seats: {seatingPlan.totalSeats}
        </Text>

        <Accordion mb="xs">
          <Accordion.Item value="categories">
            <Accordion.Control>
              <Group position="apart">
                <Text>Categories</Text>
                <Badge>{seatingPlan.categories.length}</Badge>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {seatingPlan.categories.map((category, index) => (
                <Group key={category.name} mb="xs" position="apart" noWrap>
                  <Stack spacing="xs" style={{ flex: 1 }}>
                    <Group noWrap>
                      <TextInput
                        value={category.name}
                        onChange={(e) =>
                          handleUpdateCategory(index, { name: e.target.value })
                        }
                        size="xs"
                        style={{ flex: 1 }}
                      />
                      <ColorInput
                        value={category.color}
                        onChange={(color) =>
                          handleUpdateCategory(index, { color })
                        }
                        size="xs"
                        style={{ width: 100 }}
                      />
                    </Group>
                    <Text size="xs" color="dimmed">
                      Seats: {category.seatCount}
                    </Text>
                  </Stack>
                  <Button
                    color="red"
                    variant="subtle"
                    size="xs"
                    onClick={() => handleDeleteCategory(index)}
                    ml="xs"
                  >
                    Remove
                  </Button>
                </Group>
              ))}

              <Group mt="xs">
                <TextInput
                  placeholder="Category Name"
                  value={newCategory.name || ''}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  size="xs"
                  style={{ flex: 1 }}
                />
                <ColorInput
                  value={newCategory.color || '#000000'}
                  onChange={(color) =>
                    setNewCategory({ ...newCategory, color })
                  }
                  size="xs"
                />
                <Button size="xs" onClick={handleAddCategory}>
                  Add
                </Button>
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Stack spacing="xs">
          <Text size="xs" weight={500}>
            Background Image
          </Text>
          <Group spacing="xs">
            <FileInput
              placeholder="Upload image"
              accept="image/*"
              onChange={handleBackgroundImage}
              style={{ flex: 1 }}
              value={null}
            />
            {seatingPlan.backgroundImage && (
              <Button
                variant="light"
                color="red"
                onClick={handleRemoveBackground}
              >
                Remove
              </Button>
            )}
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
};

export default PlanSettingsPanel;
