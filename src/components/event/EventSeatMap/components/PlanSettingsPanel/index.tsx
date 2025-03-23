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
} from '@mantine/core';
import { SeatingPlan, Category } from '../../types';
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
    onUpdate({ ...seatingPlan, ...updates });
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleUpdate({ backgroundImage: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card shadow="sm" p="md">
      <Card.Section p="md">
        <h3>Plan Settings</h3>
      </Card.Section>

      <TextInput
        label="Plan Name"
        value={seatingPlan.name}
        onChange={(e) => handleUpdate({ name: e.target.value })}
        mb="sm"
      />

      <Group grow mb="sm">
        <NumberInput
          label="Width"
          value={seatingPlan.size.width}
          onChange={(value) =>
            handleUpdate({
              size: {
                width: value || seatingPlan.size.width,
                height: seatingPlan.size.height,
              },
            })
          }
          min={100}
        />
        <NumberInput
          label="Height"
          value={seatingPlan.size.height}
          onChange={(value) =>
            handleUpdate({
              size: {
                width: seatingPlan.size.width,
                height: value || seatingPlan.size.height,
              },
            })
          }
          min={100}
        />
      </Group>

      <Text size="sm" mb="xs">
        Total Seats: {seatingPlan.totalSeats}
      </Text>

      <Accordion defaultValue="categories" mb="md">
        <Accordion.Item value="categories">
          <Accordion.Control>
            <Group position="apart">
              <Text>Categories</Text>
              <Badge>{seatingPlan.categories.length}</Badge>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            {seatingPlan.categories.map((category, index) => (
              <Group key={category.name} mb="sm" position="apart" noWrap>
                <Stack spacing="xs" style={{ flex: 1 }}>
                  <Group noWrap>
                    <TextInput
                      value={category.name}
                      onChange={(e) =>
                        handleUpdateCategory(index, { name: e.target.value })
                      }
                      size="sm"
                      style={{ flex: 1 }}
                    />
                    <ColorInput
                      value={category.color}
                      onChange={(color) => handleUpdateCategory(index, { color })}
                      size="sm"
                      style={{ width: 100 }}
                    />
                  </Group>
                  <Text size="xs" color="dimmed">Seats: {category.seatCount}</Text>
                </Stack>
                <Button
                  color="red"
                  variant="subtle"
                  size="sm"
                  onClick={() => handleDeleteCategory(index)}
                  ml="xs"
                >
                  Remove
                </Button>
              </Group>
            ))}

            <Group mt="md">
              <TextInput
                placeholder="Category Name"
                value={newCategory.name || ''}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                size="sm"
                style={{ flex: 1 }}
              />
              <ColorInput
                value={newCategory.color || '#000000'}
                onChange={(color) => setNewCategory({ ...newCategory, color })}
                size="sm"
              />
              <Button size="sm" onClick={handleAddCategory}>
                Add
              </Button>
            </Group>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <FileInput
        label="Background Image"
        accept="image/*"
        placeholder="Upload image"
        onChange={handleBackgroundImage}
        clearable
      />
    </Card>
  );
};

export default PlanSettingsPanel;
