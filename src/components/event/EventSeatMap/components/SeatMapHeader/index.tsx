import React from 'react';
import { Space, Button, Input, Tooltip, Divider, Switch } from 'antd';
import {
  SelectOutlined,
  TableOutlined,
  FontSizeOutlined,
  BorderOutlined,
  EllipsisOutlined,
  StarOutlined,
  CiCircleFilled,
  ZoomInOutlined,
  ZoomOutOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  AppstoreOutlined,
  BorderlessTableOutlined,
} from '@ant-design/icons';
import { EditorTool } from '../../types';
import { ButtonGroup } from './styles';

interface SeatMapHeaderProps {
  currentTool: EditorTool;
  zoom: number;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: EditorTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (value: number) => void;
  onShowGridChange: (checked: boolean) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const SeatMapHeader: React.FC<SeatMapHeaderProps> = ({
  currentTool,
  zoom,
  showGrid,
  canUndo,
  canRedo,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  onShowGridChange,
  onSave,
  onUndo,
  onRedo,
}) => {
  return (
    <Space size="middle">
      <ButtonGroup>
        <Tooltip title="Select Individual Seats">
          <Button
            type={
              currentTool === EditorTool.SELECT_SEAT ? 'primary' : 'default'
            }
            icon={<SelectOutlined />}
            onClick={() => onToolChange(EditorTool.SELECT_SEAT)}
          />
        </Tooltip>
        <Tooltip title="Select Rows and Shapes">
          <Button
            type={currentTool === EditorTool.SELECT_ROW ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => onToolChange(EditorTool.SELECT_ROW)}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider type="vertical" />

      <ButtonGroup>
        <Tooltip title="Add Row">
          <Button
            type={currentTool === EditorTool.ADD_ROW ? 'primary' : 'default'}
            icon={<TableOutlined />}
            onClick={() => onToolChange(EditorTool.ADD_ROW)}
          />
        </Tooltip>
        <Tooltip title="Add Rectangle Row">
          <Button
            type={
              currentTool === EditorTool.ADD_RECT_ROW ? 'primary' : 'default'
            }
            icon={<BorderlessTableOutlined />}
            onClick={() => onToolChange(EditorTool.ADD_RECT_ROW)}
          />
        </Tooltip>
        <Tooltip title="Add Shape">
          <Button
            type={currentTool === EditorTool.ADD_SHAPE ? 'primary' : 'default'}
            icon={<BorderOutlined />}
            onClick={() => onToolChange(EditorTool.ADD_SHAPE)}
          />
        </Tooltip>
        <Tooltip title="Add Circle">
          <Button
            type={currentTool === EditorTool.ADD_CIRCLE ? 'primary' : 'default'}
            icon={<CiCircleFilled />}
            onClick={() => onToolChange(EditorTool.ADD_CIRCLE)}
          />
        </Tooltip>
        <Tooltip title="Add Ellipse">
          <Button
            type={
              currentTool === EditorTool.ADD_ELLIPSE ? 'primary' : 'default'
            }
            icon={<EllipsisOutlined rotate={90} />}
            onClick={() => onToolChange(EditorTool.ADD_ELLIPSE)}
          />
        </Tooltip>
        <Tooltip title="Add Polygon">
          <Button
            type={
              currentTool === EditorTool.ADD_POLYGON ? 'primary' : 'default'
            }
            icon={<StarOutlined />}
            onClick={() => onToolChange(EditorTool.ADD_POLYGON)}
          />
        </Tooltip>
        <Tooltip title="Add Text">
          <Button
            type={currentTool === EditorTool.ADD_TEXT ? 'primary' : 'default'}
            icon={<FontSizeOutlined />}
            onClick={() => onToolChange(EditorTool.ADD_TEXT)}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider type="vertical" />

      <ButtonGroup>
        <Tooltip title="Zoom Out">
          <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
        </Tooltip>
        <Input
          style={{ width: 70 }}
          suffix="%"
          value={Math.round(zoom * 100)}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value)) {
              onZoomChange(value / 100);
            }
          }}
        />
        <Tooltip title="Zoom In">
          <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
        </Tooltip>
      </ButtonGroup>

      <ButtonGroup>
        <Tooltip title="Undo">
          <Button
            icon={<UndoOutlined />}
            onClick={onUndo}
            disabled={!canUndo}
          />
        </Tooltip>
        <Tooltip title="Redo">
          <Button
            icon={<RedoOutlined />}
            onClick={onRedo}
            disabled={!canRedo}
          />
        </Tooltip>
      </ButtonGroup>

      <Tooltip title="Toggle Grid">
        <Switch
          checkedChildren="Grid"
          unCheckedChildren="Grid"
          checked={showGrid}
          onChange={onShowGridChange}
        />
      </Tooltip>

      <Tooltip title="Save Changes">
        <Button type="primary" icon={<SaveOutlined />} onClick={onSave} />
      </Tooltip>
    </Space>
  );
};

export default SeatMapHeader;
