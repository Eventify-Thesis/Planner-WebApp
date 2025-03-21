import React, { useRef } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Upload,
  List,
  Button,
  Space,
  Tabs,
  Switch,
  Divider,
  Typography,
  Select,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  UndoOutlined,
  RedoOutlined,
  SelectOutlined,
  TableOutlined,
  FontSizeOutlined,
  BorderOutlined,
  EllipsisOutlined,
  StarOutlined,
  CiCircleFilled,
} from '@ant-design/icons';
import { SeatingPlan, Category, EditorTool } from '../../types';
import './PlanSettingsPanel.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface PlanSettingsPanelProps {
  seatingPlan: SeatingPlan;
  onPlanChange: (plan: SeatingPlan) => void;
  currentTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
}

const PlanSettingsPanel: React.FC<PlanSettingsPanelProps> = ({
  seatingPlan,
  onPlanChange,
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomChange,
  showGrid,
  onShowGridChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const updatedCategories = seatingPlan.categories.filter(
      (_, i) => i !== index,
    );
    onPlanChange({
      ...seatingPlan,
      categories: updatedCategories,
    });
  };

  const handleNewPlan = () => {
    onPlanChange({
      id: 'new',
      name: 'New Seating Plan',
      size: { width: 800, height: 600 },
      categories: [],
      zones: [
        {
          uuid: 'default',
          name: 'Ground Floor',
          zone_id: 'ground-floor',
          position: { x: 0, y: 0 },
          rows: [],
          areas: [],
        },
      ],
    });
  };

  const handleSavePlan = () => {
    const dataStr = JSON.stringify(seatingPlan, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataUri);
    downloadAnchorNode.setAttribute('download', seatingPlan.name + '.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoadPlan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const plan = JSON.parse(event.target?.result as string);
          onPlanChange(plan);
        } catch (error) {
          console.error('Error loading plan:', error);
        }
      };
      reader.readAsText(file);
    }
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

  const totalSeats = seatingPlan.zones.reduce(
    (total, zone) =>
      total +
      zone.rows.reduce((zoneTotal, row) => zoneTotal + row.seats.length, 0),
    0,
  );

  return (
    <Tabs className="plan-settings-tabs">
      <TabPane tab="File" key="1">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<FileAddOutlined />} onClick={handleNewPlan} block>
            New Plan
          </Button>
          <Button
            icon={<FolderOpenOutlined />}
            onClick={() => fileInputRef.current?.click()}
            block
          >
            Load Plan
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLoadPlan}
            style={{ display: 'none' }}
            accept=".json"
          />
          <Button icon={<SaveOutlined />} onClick={handleSavePlan} block>
            Save Plan
          </Button>
        </Space>
      </TabPane>

      <TabPane tab="Tools" key="2">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5}>Selection Tools</Title>
          <Space>
            <Button
              type={currentTool === EditorTool.SELECT ? 'primary' : 'default'}
              icon={<SelectOutlined />}
              onClick={() => onToolChange(EditorTool.SELECT)}
            >
              Select Objects
            </Button>
            <Button
              type={
                currentTool === EditorTool.SELECT_ROW ? 'primary' : 'default'
              }
              icon={<SelectOutlined />}
              onClick={() => onToolChange(EditorTool.SELECT_ROW)}
            >
              Select Row
            </Button>
          </Space>

          <Title level={5}>Add Elements</Title>
          <Space wrap>
            <Button
              type={currentTool === EditorTool.ADD_ROW ? 'primary' : 'default'}
              icon={<TableOutlined />}
              onClick={() => onToolChange(EditorTool.ADD_ROW)}
            >
              Add Row
            </Button>
            <Button
              type={
                currentTool === EditorTool.ADD_RECT_ROW ? 'primary' : 'default'
              }
              icon={<BorderOutlined />}
              onClick={() => onToolChange(EditorTool.ADD_RECT_ROW)}
            >
              Add Rectangle Row
            </Button>
            <Button
              type={
                currentTool === EditorTool.ADD_SHAPE ? 'primary' : 'default'
              }
              icon={<BorderOutlined />}
              onClick={() => onToolChange(EditorTool.ADD_SHAPE)}
            >
              Add Rectangle
            </Button>
            <Button
              type={
                currentTool === EditorTool.ADD_CIRCLE ? 'primary' : 'default'
              }
              icon={<CiCircleFilled />}
              onClick={() => onToolChange(EditorTool.ADD_CIRCLE)}
            >
              Add Circle
            </Button>
            <Button
              type={
                currentTool === EditorTool.ADD_ELLIPSE ? 'primary' : 'default'
              }
              icon={<EllipsisOutlined />}
              onClick={() => onToolChange(EditorTool.ADD_ELLIPSE)}
            >
              Add Ellipse
            </Button>
            <Button
              type={
                currentTool === EditorTool.ADD_POLYGON ? 'primary' : 'default'
              }
              icon={<StarOutlined />}
              onClick={() => onToolChange(EditorTool.ADD_POLYGON)}
            >
              Add Polygon
            </Button>
            <Button
              type={currentTool === EditorTool.ADD_TEXT ? 'primary' : 'default'}
              icon={<FontSizeOutlined />}
              onClick={() => onToolChange(EditorTool.ADD_TEXT)}
            >
              Add Text
            </Button>
          </Space>

          <Title level={5}>History</Title>
          <Space>
            <Button
              icon={<UndoOutlined />}
              onClick={onUndo}
              disabled={!canUndo}
            >
              Undo
            </Button>
            <Button
              icon={<RedoOutlined />}
              onClick={onRedo}
              disabled={!canRedo}
            >
              Redo
            </Button>
          </Space>

          <Title level={5}>View Options</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>Zoom Level: {Math.round(zoom * 100)}%</Text>
              <InputNumber
                min={50}
                max={200}
                value={Math.round(zoom * 100)}
                onChange={(value) => value && onZoomChange(value / 100)}
                addonAfter="%"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <Text>Show Grid</Text>
              <Switch checked={showGrid} onChange={onShowGridChange} />
            </div>
          </Space>
        </Space>
      </TabPane>

      <TabPane tab="Properties" key="3">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5}>Plan Properties</Title>
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

            <Form.Item label="Total Seats">
              <Text strong>{totalSeats}</Text>
            </Form.Item>

            <Form.Item label="Background Image">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleBackgroundUpload}
              >
                <Button icon={<UploadOutlined />}>
                  {seatingPlan.backgroundImage
                    ? 'Change Image'
                    : 'Upload Image'}
                </Button>
              </Upload>
            </Form.Item>

            <Divider />

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
        </Space>
      </TabPane>
    </Tabs>
  );
};

export default PlanSettingsPanel;
