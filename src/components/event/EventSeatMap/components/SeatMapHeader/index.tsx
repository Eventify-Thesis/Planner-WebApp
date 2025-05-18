import React from 'react';
import { Space, Button, Input, Tooltip, Divider, Dropdown } from 'antd';
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
  DownloadOutlined,
} from '@ant-design/icons';
import { EditorTool } from '../../types';
import { ButtonGroup } from './styles';
import type { MenuProps } from 'antd';
import { SegmentedControl, Text, Group, Switch } from '@mantine/core';
import { IconArmchair, IconSquare } from '@tabler/icons-react';

interface SeatMapHeaderProps {
  currentTool: EditorTool;
  zoom: number;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canCopy: boolean;
  canPaste: boolean;
  canCut: boolean;
  mode: 'seat' | 'section';
  onModeChange: (mode: 'seat' | 'section') => void;
  onToolChange: (tool: EditorTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (value: number) => void;
  onShowGridChange: (checked: boolean) => void;
  onSave: () => void;
  onSaveToComputer: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onCut: () => void;
  onNewPlan: () => void;
  onLoadPlan: () => void;
  loading?: boolean;
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
  mode,
  onModeChange,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  onShowGridChange,
  onSave,
  onSaveToComputer,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onCut,
  onNewPlan,
  onLoadPlan,
  loading = false,
}) => {
  const fileItems: MenuProps['items'] = [
    {
      key: 'new',
      icon: <FileAddOutlined />,
      label: 'New Plan',
      onClick: onNewPlan,
      disabled: loading,
    },
    {
      key: 'load',
      icon: <FolderOpenOutlined />,
      label: 'Load Plan',
      onClick: onLoadPlan,
      disabled: loading,
    },
    {
      key: 'save',
      icon: <SaveOutlined />,
      label: 'Save Plan',
      onClick: onSave,
      disabled: loading,
    },
    {
      key: 'saveToComputer',
      icon: <DownloadOutlined />,
      label: 'Save to Computer',
      onClick: onSaveToComputer,
      disabled: loading,
    },
  ];

  return (
    <Space
      size="middle"
      style={{
        padding: '8px 16px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {/* File Operations */}
      <ButtonGroup>
        <Dropdown menu={{ items: fileItems }} placement="bottomLeft">
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      </ButtonGroup>

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* Mode Toggle */}
      <Group gap="xs">
        <Text size="sm" fw={500}>
          Mode:
        </Text>
        <SegmentedControl
          value={mode}
          onChange={(value) => onModeChange(value as 'seat' | 'section')}
          data={[
            {
              value: 'seat',
              label: (
                <Group gap="xs" justify="center" wrap="nowrap">
                  <IconArmchair size={16} />
                  <Text size="sm">Seats</Text>
                </Group>
              ),
            },
            {
              value: 'section',
              label: (
                <Group gap="xs" justify="center" wrap="nowrap">
                  <IconSquare size={16} />
                  <Text size="sm">Sections</Text>
                </Group>
              ),
            },
          ]}
        />
      </Group>

      <Divider type="vertical" style={{ height: '24px' }} />

      {/* Selection Tools */}
      <ButtonGroup>
        {mode === 'seat' ? (
          <>
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
                type={
                  currentTool === EditorTool.SELECT_ROW ? 'primary' : 'default'
                }
                icon={<AppstoreOutlined />}
                onClick={() => onToolChange(EditorTool.SELECT_ROW)}
              />
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Select Sections">
            <Button
              type={
                currentTool === EditorTool.SELECT_SECTION
                  ? 'primary'
                  : 'default'
              }
              icon={<IconSquare size={16} />}
              onClick={() => onToolChange(EditorTool.SELECT_SECTION)}
            />
          </Tooltip>
        )}
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

      {mode === 'seat' ? (
        <>
          {/* Row Tools */}
          <ButtonGroup>
            <Tooltip title="Add Row">
              <Button
                type={
                  currentTool === EditorTool.ADD_ROW ? 'primary' : 'default'
                }
                icon={<TableOutlined />}
                onClick={() => onToolChange(EditorTool.ADD_ROW)}
              />
            </Tooltip>
            <Tooltip title="Add Rectangle Row">
              <Button
                type={
                  currentTool === EditorTool.ADD_RECT_ROW
                    ? 'primary'
                    : 'default'
                }
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
                type={
                  currentTool === EditorTool.ADD_SHAPE ? 'primary' : 'default'
                }
                icon={<BorderOutlined />}
                onClick={() => onToolChange(EditorTool.ADD_SHAPE)}
              />
            </Tooltip>
            <Tooltip title="Add Circle">
              <Button
                type={
                  currentTool === EditorTool.ADD_CIRCLE ? 'primary' : 'default'
                }
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
                type={
                  currentTool === EditorTool.ADD_TEXT ? 'primary' : 'default'
                }
                icon={<FontSizeOutlined />}
                onClick={() => onToolChange(EditorTool.ADD_TEXT)}
              />
            </Tooltip>
          </ButtonGroup>
        </>
      ) : (
        <>
          {/* Section Tools */}
          <ButtonGroup>
            <Tooltip title="Add Rectangle Section">
              <Button
                type={
                  currentTool === EditorTool.ADD_SECTION_RECT
                    ? 'primary'
                    : 'default'
                }
                icon={<BorderOutlined />}
                onClick={() => onToolChange(EditorTool.ADD_SECTION_RECT)}
              />
            </Tooltip>
            <Tooltip title="Add Circle Section">
              <Button
                type={
                  currentTool === EditorTool.ADD_SECTION_CIRCLE
                    ? 'primary'
                    : 'default'
                }
                icon={<CiCircleFilled />}
                onClick={() => onToolChange(EditorTool.ADD_SECTION_CIRCLE)}
              />
            </Tooltip>
            <Tooltip title="Add Ellipse Section">
              <Button
                type={
                  currentTool === EditorTool.ADD_SECTION_ELLIPSE
                    ? 'primary'
                    : 'default'
                }
                icon={<EllipsisOutlined />}
                onClick={() => onToolChange(EditorTool.ADD_SECTION_ELLIPSE)}
              />
            </Tooltip>
          </ButtonGroup>

          {/* Shape Tools */}
          <ButtonGroup>
            <Tooltip title="Add Shape">
              <Button
                type={
                  currentTool === EditorTool.ADD_SHAPE ? 'primary' : 'default'
                }
                icon={<BorderOutlined />}
                onClick={() => onToolChange(EditorTool.ADD_SHAPE)}
              />
            </Tooltip>
            <Tooltip title="Add Circle">
              <Button
                type={
                  currentTool === EditorTool.ADD_CIRCLE ? 'primary' : 'default'
                }
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
                type={
                  currentTool === EditorTool.ADD_TEXT ? 'primary' : 'default'
                }
                icon={<FontSizeOutlined />}
                onClick={() => onToolChange(EditorTool.ADD_TEXT)}
              />
            </Tooltip>
          </ButtonGroup>
        </>
      )}

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
      <Switch
        checked={showGrid}
        onChange={(event) => onShowGridChange(event.currentTarget.checked)}
        label={showGrid ? 'Grid On' : 'Grid Off'}
        size="sm"
      />
    </Space>
  );
};

export default SeatMapHeader;
