import React, { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Group, Line, Circle, Rect, Ellipse } from 'react-konva';
import { SeatingPlan, EditorTool, Selection } from '../..//types/index';
import { useCanvasState } from '../../hooks/useCanvasState';
import { useCanvasHandlers } from '../../hooks/useCanvasHandlers';
import { ShapeLayer } from './components/ShapeLayer';
import { RowLayer } from './components/RowLayer';
import { renderRowPreview, renderRectRowPreview } from './utils/rowUtils';
import './Canvas.css';
import GridLayer from './components/GridLayer';
import TransformerLayer from './components/TransformerLayer';
import BackgroundLayer from './components/BackgroundLayer';

interface CanvasProps {
  seatingPlan: SeatingPlan;
  currentTool: EditorTool;
  zoom: number;
  showGrid: boolean;
  onPlanChange: (plan: SeatingPlan) => void;
  selection: Selection;
  onSelectionChange: (selection: Selection) => void;
  setCurrentTool: (tool: EditorTool) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  seatingPlan,
  currentTool,
  zoom,
  showGrid,
  onPlanChange,
  selection,
  onSelectionChange,
  setCurrentTool,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, setters, actions, handlePlanChange } = useCanvasState(
    selection,
    onSelectionChange,
    onPlanChange,
  );
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSelect,
    handleDragStart,
    handleDragEnd,
  } = useCanvasHandlers(
    zoom,
    seatingPlan,
    currentTool,
    handlePlanChange,
    onSelectionChange,
    state,
    setters,
    actions,
  );

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      if (
        offsetWidth !== state.stageSize.width ||
        offsetHeight !== state.stageSize.height
      ) {
        setters.setStageSize({
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    }
  }, [setters, state.stageSize]);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input-like element
      const activeElement = document.activeElement;
      const isInputElement =
        activeElement instanceof HTMLElement &&
        (activeElement.isContentEditable ||
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT');

      // Only handle delete/backspace if we're not in an input element
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputElement) {
        // Check if we have any selection before preventing default
        const hasSelection = Object.values(state.selection.selectedItems).some(
          (arr) => arr.length > 0,
        );
        if (!hasSelection) return;

        e.preventDefault();
        const updatedPlan = { ...seatingPlan };
        const { seats, rows, areas } = state.selection.selectedItems;

        // Remove selected seats
        if (seats.length > 0) {
          updatedPlan.zones[0].rows = updatedPlan.zones[0].rows.map((row) => ({
            ...row,
            seats: row.seats.filter((seat) => !seats.includes(seat.uuid)),
          }));
        }

        // Remove selected rows
        if (rows.length > 0) {
          updatedPlan.zones[0].rows = updatedPlan.zones[0].rows.filter(
            (row) => !rows.includes(row.uuid),
          );
        }

        // Remove selected shapes
        if (areas.length > 0) {
          updatedPlan.zones[0].areas = updatedPlan.zones[0].areas.filter(
            (area) => !areas.includes(area.uuid),
          );
        }

        actions.addToHistory(updatedPlan);
        handlePlanChange(updatedPlan);
        setters.setSelection({
          selectedItems: { seats: [], rows: [], areas: [] },
        });
      }

      // Handle copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        const { seats, rows, areas } = state.selection.selectedItems;

        if (seats.length > 0) {
          const selectedSeats = seatingPlan.zones[0].rows.flatMap((row) =>
            row.seats.filter((seat) => seats.includes(seat.uuid)),
          );
          setters.setClipboard({
            type: 'seats',
            items: JSON.parse(JSON.stringify(selectedSeats)),
          });
        } else if (rows.length > 0) {
          const selectedItems = [
            ...seatingPlan.zones[0].rows.filter((row) =>
              rows.includes(row.uuid),
            ),
            ...seatingPlan.zones[0].areas.filter((area) =>
              areas.includes(area.uuid),
            ),
          ];
          setters.setClipboard({
            type: 'row',
            items: JSON.parse(JSON.stringify(selectedItems)),
          });
        } else if (areas.length > 0) {
          const selectedShapes = seatingPlan.zones[0].areas.filter((area) =>
            areas.includes(area.uuid),
          );
          setters.setClipboard({
            type: 'shape',
            items: JSON.parse(JSON.stringify(selectedShapes)),
          });
        }
      }

      // Handle paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && state.clipboard) {
        e.preventDefault();
        const updatedPlan = { ...seatingPlan };
        const offset = { x: 20, y: 20 }; // Offset for pasted items

        switch (state.clipboard.type) {
          case 'seats': {
            // Existing seats paste logic
            break;
          }
          case 'row': {
            // Existing row paste logic
            const newItems = state.clipboard.items.map((item: any) => ({
              ...item,
              uuid: crypto.randomUUID(),
              position: {
                x: item.position.x + offset.x,
                y: item.position.y + offset.y,
              },
              seats: (item.seats || []).map((seat: any) => ({
                ...seat,
                uuid: crypto.randomUUID(),
              })),
            }));

            updatedPlan.zones[0].rows = [
              ...updatedPlan.zones[0].rows,
              ...newItems.filter((item: any) => item.seats),
            ];
            updatedPlan.zones[0].areas = [
              ...updatedPlan.zones[0].areas,
              ...newItems.filter((item: any) => !item.seats),
            ];
            break;
          }
          case 'shape': {
            const newShapes = state.clipboard.items.map((shape: any) => ({
              ...shape,
              uuid: crypto.randomUUID(),
              position: {
                x: shape.position.x + offset.x,
                y: shape.position.y + offset.y,
              },
              // Handle different shape types
              ...(shape.size && {
                size: { ...shape.size },
              }),
              ...(shape.points && {
                points: shape.points.map((point: any) => ({
                  x: point.x + offset.x,
                  y: point.y + offset.y,
                })),
              }),
            }));

            updatedPlan.zones[0].areas = [
              ...updatedPlan.zones[0].areas,
              ...newShapes,
            ];
            break;
          }
        }

        actions.addToHistory(updatedPlan);
        handlePlanChange(updatedPlan);
      }

      // Handle undo/redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            const redoResult = actions.redo();
            if (redoResult) {
              handlePlanChange(redoResult);
            }
          } else {
            const undoResult = actions.undo();
            if (undoResult) {
              handlePlanChange(undoResult);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selection, seatingPlan, handlePlanChange, setters, actions]);

  const handleSeatDoubleClick = () => {
    if (currentTool === EditorTool.SELECT_ROW) {
      setCurrentTool(EditorTool.SELECT_SEAT);
    }
  };

  const renderPreview = () => {
    if (!state.previewShape || !state.startPoint) return null;

    const commonProps = {
      fill: 'rgba(200, 200, 200, 0.5)',
      stroke: '#666',
      strokeWidth: 1,
      dash: [5, 5],
    };

    switch (currentTool) {
      case EditorTool.ADD_SHAPE: {
        const width = Math.abs(
          state.previewShape.endPoint.x - state.startPoint.x,
        );
        const height = Math.abs(
          state.previewShape.endPoint.y - state.startPoint.y,
        );
        const x = Math.min(state.startPoint.x, state.previewShape.endPoint.x);
        const y = Math.min(state.startPoint.y, state.previewShape.endPoint.y);
        return (
          <Rect x={x} y={y} width={width} height={height} {...commonProps} />
        );
      }

      case EditorTool.ADD_CIRCLE: {
        const dx = state.previewShape.endPoint.x - state.startPoint.x;
        const dy = state.previewShape.endPoint.y - state.startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy) / 2;
        const centerX =
          (state.startPoint.x + state.previewShape.endPoint.x) / 2;
        const centerY =
          (state.startPoint.y + state.previewShape.endPoint.y) / 2;
        return (
          <Circle x={centerX} y={centerY} radius={radius} {...commonProps} />
        );
      }

      case EditorTool.ADD_ELLIPSE: {
        const width = Math.abs(
          state.previewShape.endPoint.x - state.startPoint.x,
        );
        const height = Math.abs(
          state.previewShape.endPoint.y - state.startPoint.y,
        );
        const centerX =
          (state.startPoint.x + state.previewShape.endPoint.x) / 2;
        const centerY =
          (state.startPoint.y + state.previewShape.endPoint.y) / 2;
        return (
          <Ellipse
            x={centerX}
            y={centerY}
            radiusX={width / 2}
            radiusY={height / 2}
            {...commonProps}
          />
        );
      }

      case EditorTool.ADD_ROW: {
        const preview = renderRowPreview(
          state.startPoint,
          state.previewShape.endPoint,
          commonProps,
        );
        return (
          <Group>
            <Line points={preview.linePoints} {...commonProps} />
            {preview.seatPositions.map((pos, i) => (
              <Circle
                key={i}
                x={pos.x}
                y={pos.y}
                radius={15}
                {...commonProps}
              />
            ))}
          </Group>
        );
      }

      case EditorTool.ADD_RECT_ROW: {
        const preview = renderRectRowPreview(
          state.startPoint,
          state.previewShape.endPoint,
        );
        return (
          <Group>
            {preview.rowLines.map((line, row) => (
              <Line key={`row-${row}`} points={line.points} {...commonProps} />
            ))}
            {preview.seatPositions.map((pos) => (
              <Circle
                key={pos.key}
                x={pos.x}
                y={pos.y}
                radius={15}
                {...commonProps}
              />
            ))}
          </Group>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className="canvas-container">
      <Stage
        width={state.stageSize.width}
        height={state.stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        scale={{ x: zoom, y: zoom }}
      >
        <BackgroundLayer
          backgroundImage={seatingPlan.backgroundImage}
          stageSize={state.stageSize}
        />

        {showGrid && (
          <GridLayer
            stageSize={state.stageSize}
            gridSize={20}
            zoom={zoom}
            visible={true}
          />
        )}

        <ShapeLayer
          seatingPlan={seatingPlan}
          selection={state.selection}
          currentTool={currentTool}
          zoom={zoom}
          onPlanChange={handlePlanChange}
          onSelect={handleSelect}
        />

        <RowLayer
          seatingPlan={seatingPlan}
          selection={state.selection}
          currentTool={currentTool}
          onSelect={handleSelect}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onSeatDoubleClick={handleSeatDoubleClick}
        />

        <TransformerLayer
          selection={state.selection}
          currentTool={currentTool}
          onTransform={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            const rotation = node.rotation();

            // Update the seating plan with new transform values
            const updatedPlan = { ...seatingPlan };
            const nodeId = node.id();

            // Update shape if found
            const shape = updatedPlan.zones[0].areas.find(
              (a) => a.uuid === nodeId,
            );
            if (shape) {
              if (shape.size) {
                shape.size.width *= scaleX;
                shape.size.height *= scaleY;
              }
              if (shape.radius) {
                shape.radius *= (scaleX + scaleY) / 2;
              }
              // Reset scale since we applied it to the actual dimensions
              node.scaleX(1);
              node.scaleY(1);
            }

            // Update row if found
            const row = updatedPlan.zones[0].rows.find(
              (r) => r.uuid === nodeId,
            );
            if (row) {
              // For rows, we only allow rotation
              node.scaleX(1);
              node.scaleY(1);
            }

            handlePlanChange(updatedPlan);
          }}
        />

        {(state.previewShape || state.dragPreview) && (
          <Layer>
            {renderPreview()}
            {state.dragPreview &&
              state.dragPreview.seats.map((seat) => (
                <Circle
                  key={seat.uuid}
                  x={seat.position.x}
                  y={seat.position.y}
                  radius={15}
                  fill="rgba(100, 150, 255, 0.3)"
                  stroke="#4444ff"
                  strokeWidth={1}
                  dash={[5, 5]}
                />
              ))}
          </Layer>
        )}

        {state.selectionBox && (
          <Layer>
            <Rect
              x={Math.min(
                state.selectionBox.startPoint.x,
                state.selectionBox.endPoint.x,
              )}
              y={Math.min(
                state.selectionBox.startPoint.y,
                state.selectionBox.endPoint.y,
              )}
              width={Math.abs(
                state.selectionBox.endPoint.x - state.selectionBox.startPoint.x,
              )}
              height={Math.abs(
                state.selectionBox.endPoint.y - state.selectionBox.startPoint.y,
              )}
              stroke="#4444ff"
              strokeWidth={1}
              dash={[5, 5]}
              fill="rgba(100, 150, 255, 0.1)"
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default Canvas;
