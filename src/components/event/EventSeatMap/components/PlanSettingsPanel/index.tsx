import React from 'react';
import { Form, Input, InputNumber, Upload, List, Tag, Button, Space } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { SeatingPlan, Category } from '../../types';
import './PlanSettingsPanel.css';

interface PlanSettingsPanelProps {
  seatingPlan: SeatingPlan;
  onPlanChange: (plan: SeatingPlan) => void;
}

const PlanSettingsPanel: React.FC<PlanSettingsPanelProps> = ({
  seatingPlan,
  onPlanChange,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPlanChange({
      ...seatingPlan,
      name: e.target.value,
    });
  };

  const handleSizeChange = (
    value: number | null,
    dimension: 'width' | 'height',
  ) => {
    if (value !== null) {
      onPlanChange({
        ...seatingPlan,
        size: {
          ...seatingPlan.size,
          [dimension]: value,
        },
      });
    }
  };

  const handleCategoryAdd = () => {
    const newCategory: Category = {
      name: `Category ${seatingPlan.categories.length + 1}`,
      color: '#000000',
    };

    onPlanChange({
      ...seatingPlan,
      categories: [...seatingPlan.categories, newCategory],
    });
  };

  const handleCategoryUpdate = (index: number, updates: Partial<Category>) => {
    const updatedCategories = [...seatingPlan.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      ...updates,
    };

    onPlanChange({
      ...seatingPlan,
      categories: updatedCategories,
    });
  };

  const handleCategoryDelete = (index: number) => {
    const updatedCategories = seatingPlan.categories.filter((_, i) => i !== index);
    onPlanChange({
      ...seatingPlan,
      categories: updatedCategories,
    });
  };

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onPlanChange({
        ...seatingPlan,
        backgroundImage: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div className="plan-settings">
      <Form layout="vertical">
        <Form.Item label="Plan Name">
          <Input value={seatingPlan.name} onChange={handleNameChange} />
        </Form.Item>

        <Form.Item label="Canvas Size">
          <Space>
            <InputNumber
              min={100}
              max={2000}
              value={seatingPlan.size.width}
              onChange={(value) => handleSizeChange(value, 'width')}
              addonAfter="W"
            />
            <InputNumber
              min={100}
              max={2000}
              value={seatingPlan.size.height}
              onChange={(value) => handleSizeChange(value, 'height')}
              addonAfter="H"
            />
          </Space>
        </Form.Item>

        <Form.Item label="Background Image">
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleBackgroundUpload}
          >
            <Button icon={<UploadOutlined />}>
              {seatingPlan.backgroundImage ? 'Change Image' : 'Upload Image'}
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Categories">
          <List
            dataSource={seatingPlan.categories}
            renderItem={(category, index) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    danger
                    onClick={() => handleCategoryDelete(index)}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <Space>
                  <Input
                    value={category.name}
                    onChange={(e) =>
                      handleCategoryUpdate(index, { name: e.target.value })
                    }
                  />
                  <Input
                    type="color"
                    value={category.color}
                    style={{ width: 50 }}
                    onChange={(e) =>
                      handleCategoryUpdate(index, { color: e.target.value })
                    }
                  />
                </Space>
              </List.Item>
            )}
            footer={
              <Button
                type="dashed"
                onClick={handleCategoryAdd}
                icon={<PlusOutlined />}
                block
              >
                Add Category
              </Button>
            }
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default PlanSettingsPanel;
