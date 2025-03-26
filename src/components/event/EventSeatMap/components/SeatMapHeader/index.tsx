import React from 'react';
import { Space, Button, Input, Tooltip, Divider, Switch, Dropdown } from 'antd';
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
  CopyOutlined,
  ScissorOutlined,
  SnippetsOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { EditorTool } from '../../types';
import { ButtonGroup } from './styles';
import type { MenuProps } from 'antd';

interface SeatMapHeaderProps {
  currentTool: EditorTool;
  zoom: number;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canCopy: boolean;
  canPaste: boolean;
  canCut: boolean;
  onToolChange: (tool: EditorTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (value: number) => void;
  onShowGridChange: (checked: boolean) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onNewPlan: () => void;
  onLoadPlan: () => void;
}

const SeatMapHeader: React.FC<SeatMapHeaderProps> = ({
  currentTool,
  zoom,
  showGrid,
  canUndo,
  canRedo,
  canCopy,
  canPaste,
  canCut,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  onShowGridChange,
  onSave,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onCut,
  onNewPlan,
  onLoadPlan,
}) => {
  const fileItems: MenuProps['items'] = [
    {
      key: 'new',
      icon: <FileAddOutlined />,
      label: 'New Plan',
      onClick: onNewPlan,
    },
    {
      key: 'load',
      icon: <FolderOpenOutlined />,
      label: 'Load Plan',
      onClick: onLoadPlan,
    },
    {
      key: 'save',
      icon: <SaveOutlined />,
      label: 'Save Plan',
      onClick: onSave,
    },
  ];

  return (
    <Space size="middle" style={{ padding: '8px 16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
      {/* File Operations */}
      <ButtonGroup>
        <Dropdown menu={{ items: fileItems }} placement="bottomLeft">
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      </ButtonGroup>

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* Selection Tools */}
      <ButtonGroup>
        <Tooltip title="Select Individual Seats">
          <Button
            type={currentTool === EditorTool.SELECT_SEAT ? 'primary' : 'default'}
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

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* Edit Operations */}
      <ButtonGroup>
        <Tooltip title="Copy (Ctrl+C)">
          <Button
            icon={<CopyOutlined />}
            onClick={onCopy}
            disabled={!canCopy}
          />
        </Tooltip>
        <Tooltip title="Cut (Ctrl+X)">
          <Button
            icon={<ScissorOutlined />}
            onClick={onCut}
            disabled={!canCut}
          />
        </Tooltip>
        <Tooltip title="Paste (Ctrl+V)">
          <Button
            icon={<SnippetsOutlined />}
            onClick={onPaste}
            disabled={!canPaste}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* Row Tools */}
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
            type={currentTool === EditorTool.ADD_RECT_ROW ? 'primary' : 'default'}
            icon={<BorderlessTableOutlined />}
            onClick={() => onToolChange(EditorTool.ADD_RECT_ROW)}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* Shape Tools */}
      <ButtonGroup>
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
            type={currentTool === EditorTool.ADD_ELLIPSE ? 'primary' : 'default'}
            icon={<EllipsisOutlined rotate={90} />}
            onClick={() => onToolChange(EditorTool.ADD_ELLIPSE)}
          />
        </Tooltip>
        <Tooltip title="Add Polygon">
          <Button
            type={currentTool === EditorTool.ADD_POLYGON ? 'primary' : 'default'}
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

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* History Tools */}
      <ButtonGroup>
        <Tooltip title="Undo (Ctrl+Z)">
          <Button
            icon={<UndoOutlined />}
            onClick={onUndo}
            disabled={!canUndo}
          />
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Y)">
          <Button
            icon={<RedoOutlined />}
            onClick={onRedo}
            disabled={!canRedo}
          />
        </Tooltip>
      </ButtonGroup>

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* View Tools */}
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

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* Grid Toggle */}
      <Tooltip title="Toggle Grid">
        <Switch
          checkedChildren="Grid"
          unCheckedChildren="Grid"
          checked={showGrid}
          onChange={onShowGridChange}
        />
      </Tooltip>
    </Space>
  );
};

export default SeatMapHeader;
