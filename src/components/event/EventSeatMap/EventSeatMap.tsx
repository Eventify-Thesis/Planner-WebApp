import React, { useState, useCallback } from 'react';
import { Layout, Card, Button, Space, Tabs, Input, Tooltip } from 'antd';
import {
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  SelectOutlined,
  TableOutlined,
  FontSizeOutlined,
} from '@ant-design/icons';
import { SeatingPlan, EditorTool } from './types';
import PlanSettingsPanel from './components/PlanSettingsPanel';
import Canvas from './components/Canvas';
import useEditorState from './hooks/useEditorState';
import './EventSeatMap.css';

const { Content, Sider } = Layout;

const DEFAULT_SEATING_PLAN: SeatingPlan = {
  id: 'default',
  name: 'New Seating Plan',
  size: {
    width: 800,
    height: 600,
  },
  categories: [
    { name: 'Category I', color: '#F44336' },
    { name: 'Category II', color: '#9C27B0' },
    { name: 'Category III', color: '#4CAF50' },
    { name: 'Category IV', color: '#2196F3' },
    { name: 'Category V', color: '#8BC34A' },
  ],
  zones: [
    {
      uuid: 'default-zone',
      name: 'Ground Floor',
      zone_id: 'ground-floor',
      position: { x: 0, y: 0 },
      rows: [],
      areas: [],
    },
  ],
};

const EventSeatMap: React.FC = () => {
  const [seatingPlan, setSeatingPlan] =
    useState<SeatingPlan>(DEFAULT_SEATING_PLAN);
  const {
    currentTool,
    setCurrentTool,
    zoom,
    setZoom,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorState();

  const handleSave = useCallback(() => {
    console.log('Saving seating plan:', seatingPlan);
    const dataStr = JSON.stringify(seatingPlan, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'seating-plan.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [seatingPlan]);

  const handlePlanChange = useCallback(
    (updatedPlan: SeatingPlan) => {
      setSeatingPlan(updatedPlan);
      addToHistory(updatedPlan);
    },
    [addToHistory],
  );

  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setSeatingPlan(previousState);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setSeatingPlan(nextState);
    }
  }, [redo]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  }, [setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, [setZoom]);

  const handleToolChange = useCallback(
    (tool: EditorTool) => {
      setCurrentTool(tool);
    },
    [setCurrentTool],
  );

  return (
    <Layout className="seat-map-layout">
      <div className="seat-map-header">
        <Space size="middle">
          <Space>
            <Tooltip title="Select">
              <Button
                type={currentTool === EditorTool.SELECT ? 'primary' : 'default'}
                icon={<SelectOutlined />}
                onClick={() => handleToolChange(EditorTool.SELECT)}
              />
            </Tooltip>
            <Tooltip title="Add Row">
              <Button
                type={
                  currentTool === EditorTool.ADD_ROW ? 'primary' : 'default'
                }
                icon={<TableOutlined />}
                onClick={() => handleToolChange(EditorTool.ADD_ROW)}
              />
            </Tooltip>
            <Tooltip title="Add Shape">
              <Button
                type={
                  currentTool === EditorTool.ADD_SHAPE ? 'primary' : 'default'
                }
                icon={<TableOutlined />}
                onClick={() => handleToolChange(EditorTool.ADD_SHAPE)}
              />
            </Tooltip>
            <Tooltip title="Add Text">
              <Button
                type={
                  currentTool === EditorTool.ADD_TEXT ? 'primary' : 'default'
                }
                icon={<FontSizeOutlined />}
                onClick={() => handleToolChange(EditorTool.ADD_TEXT)}
              />
            </Tooltip>
          </Space>

          <Space>
            <Tooltip title="Zoom Out">
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            </Tooltip>
            <Input
              style={{ width: 70 }}
              suffix="%"
              value={Math.round(zoom * 100)}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  setZoom(value / 100);
                }
              }}
            />
            <Tooltip title="Zoom In">
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            </Tooltip>
          </Space>

          <Space>
            <Tooltip title="Undo">
              <Button
                icon={<UndoOutlined />}
                onClick={handleUndo}
                disabled={!canUndo}
              />
            </Tooltip>
            <Tooltip title="Redo">
              <Button
                icon={<RedoOutlined />}
                onClick={handleRedo}
                disabled={!canRedo}
              />
            </Tooltip>
          </Space>

          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Save Changes
          </Button>
        </Space>
      </div>

      <Layout>
        <Content className="seat-map-content">
          <Canvas
            seatingPlan={seatingPlan}
            currentTool={currentTool}
            zoom={zoom}
            onChange={handlePlanChange}
          />
        </Content>
        <Sider width={300} theme="light" className="plan-settings-panel">
          <PlanSettingsPanel
            seatingPlan={seatingPlan}
            onPlanChange={handlePlanChange}
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default EventSeatMap;
