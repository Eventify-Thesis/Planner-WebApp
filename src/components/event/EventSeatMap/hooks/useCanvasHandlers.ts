import { useCallback } from 'react';
import { EditorTool, Point, SeatingPlan, Selection } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  createShape,
  createStraightRow,
  createRectangularRow,
} from '../components/Canvas/utils';
import { getMousePosition } from '../components/Canvas/utils/mouseUtils';
import { updateSelection } from '../components/Canvas/utils/selectionUtils';
import { createDragPreview } from '../components/Canvas/utils/dragUtils';

export const useCanvasHandlers = (
  zoom: number,
  seatingPlan: SeatingPlan,
  currentTool: EditorTool,
  onPlanChange: (plan: SeatingPlan) => void,
  onSelectionChange: (selection: Selection) => void,
  canvasState: any,
  canvasSetters: any,
  canvasActions: any,
) => {
  const initializePreviewShape = useCallback(
    (point: Point) => {
      if (
        currentTool === EditorTool.ADD_SHAPE ||
        currentTool === EditorTool.ADD_CIRCLE ||
        currentTool === EditorTool.ADD_ELLIPSE
      ) {
        canvasSetters.setPreviewShape({
          type:
            currentTool === EditorTool.ADD_CIRCLE
              ? 'circle'
              : currentTool === EditorTool.ADD_ELLIPSE
              ? 'ellipse'
              : 'rectangle',
          startPoint: point,
          endPoint: point,
        });
      }
    },
    [currentTool, canvasSetters],
  );

  const handleMouseDown = useCallback(
    (e: any) => {
      const point = getMousePosition(e, zoom);
      if (!point) return;

      if (
        currentTool === EditorTool.SELECT_ROW ||
        currentTool === EditorTool.SELECT_SEAT
      ) {
        if (e.target === e.target.getStage()) {
          canvasSetters.setSelectionBox({ startPoint: point, endPoint: point });
          canvasSetters.setSelection({ type: 'none', ids: [] });
        }
      } else {
        canvasSetters.setStartPoint(point);
        canvasSetters.setIsDrawing(true);
        initializePreviewShape(point);
      }
    },
    [currentTool, zoom, canvasSetters, initializePreviewShape],
  );

  const updatePreview = useCallback(
    (currentPoint: Point, startPoint: Point) => {
      if (
        [
          EditorTool.ADD_SHAPE,
          EditorTool.ADD_CIRCLE,
          EditorTool.ADD_ELLIPSE,
        ].includes(currentTool)
      ) {
        // Update shape preview
        canvasSetters.setPreviewShape((prev: any) =>
          prev
            ? { ...prev, endPoint: currentPoint }
            : {
                type:
                  currentTool === EditorTool.ADD_CIRCLE
                    ? 'circle'
                    : currentTool === EditorTool.ADD_ELLIPSE
                    ? 'ellipse'
                    : 'rectangle',
                startPoint,
                endPoint: currentPoint,
              },
        );
      } else if (
        [EditorTool.ADD_ROW, EditorTool.ADD_RECT_ROW].includes(currentTool)
      ) {
        // Update row preview
        canvasSetters.setPreviewShape({
          type: currentTool === EditorTool.ADD_ROW ? 'row' : 'rectRow',
          startPoint,
          endPoint: currentPoint,
        });
      }
    },
    [currentTool, canvasSetters],
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      const { selectionBox, isDragging, dragPreview, isDrawing, startPoint } =
        canvasState;

      if (selectionBox) {
        const point = getMousePosition(e, zoom);
        if (!point) return;

        canvasSetters.setSelectionBox((prev: any) => ({
          ...prev!,
          endPoint: point,
        }));

        const newSelection = updateSelection(
          seatingPlan,
          { ...selectionBox, endPoint: point },
          currentTool === EditorTool.SELECT_SEAT ? 'seat' : 'row',
        );
        canvasSetters.setSelection(newSelection);
      } else if (isDragging && dragPreview) {
        const pos = getMousePosition(e, zoom);
        if (!pos) return;

        const dx = pos.x - dragPreview.position.x;
        const dy = pos.y - dragPreview.position.y;

        canvasSetters.setDragPreview((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            position: pos,
            seats: prev.seats.map((seat: any) => ({
              ...seat,
              position: {
                x: seat.position.x + dx,
                y: seat.position.y + dy,
              },
            })),
          };
        });
      } else if (isDrawing && startPoint) {
        const currentPoint = getMousePosition(e, zoom);
        if (!currentPoint) return;

        if (
          [
            EditorTool.ADD_SHAPE,
            EditorTool.ADD_CIRCLE,
            EditorTool.ADD_ELLIPSE,
            EditorTool.ADD_ROW,
            EditorTool.ADD_RECT_ROW,
          ].includes(currentTool)
        ) {
          updatePreview(currentPoint, startPoint);
        }
      }
    },
    [canvasState, currentTool, seatingPlan, zoom, canvasSetters, updatePreview],
  );

  const handleMouseUp = useCallback(
    (e: any) => {
      const { selectionBox, isDrawing, startPoint } = canvasState;

      if (selectionBox) {
        canvasSetters.setSelectionBox(null);
      } else if (!isDrawing || !startPoint) return;

      const endPoint = getMousePosition(e, zoom);
      if (!endPoint) return;

      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      const x = Math.min(startPoint.x, endPoint.x);
      const y = Math.min(startPoint.y, endPoint.y);

      const updatedPlan = { ...seatingPlan };
      const currentZone = updatedPlan.zones[0];

      switch (currentTool) {
        case EditorTool.ADD_SHAPE: {
          const shape = {
            uuid: uuidv4(),
            type: 'rectangle',
            position: { x, y },
            size: {
              width,
              height,
            },
          };
          currentZone.areas.push(shape);
          break;
        }

        case EditorTool.ADD_CIRCLE: {
          const radius = Math.sqrt(width * width + height * height) / 2;
          const centerX = (startPoint.x + endPoint.x) / 2;
          const centerY = (startPoint.y + endPoint.y) / 2;
          const shape = {
            uuid: uuidv4(),
            type: 'circle',
            position: { x: centerX, y: centerY },
            radius,
          };
          currentZone.areas.push(shape);
          break;
        }

        case EditorTool.ADD_ELLIPSE: {
          const centerX = (startPoint.x + endPoint.x) / 2;
          const centerY = (startPoint.y + endPoint.y) / 2;
          const shape = {
            uuid: uuidv4(),
            type: 'ellipse',
            position: { x: centerX, y: centerY },
            size: {
              width,
              height,
            },
          };
          currentZone.areas.push(shape);
          break;
        }

        case EditorTool.ADD_ROW: {
          const numSeats = Math.max(Math.round(width / 30), 2);
          const dx = (endPoint.x - startPoint.x) / (numSeats - 1);
          const dy = (endPoint.y - startPoint.y) / (numSeats - 1);
          
          const seats = Array.from({ length: numSeats }, (_, i) => ({
            uuid: uuidv4(),
            position: {
              x: startPoint.x + dx * i,
              y: startPoint.y + dy * i,
            },
            status: 'available',
            number: i + 1,
          }));

          const row = {
            uuid: uuidv4(),
            seats,
            rowNumber: seatingPlan.zones[0].rows.length + 1,
          };
          currentZone.rows.push(row);
          break;
        }

        case EditorTool.ADD_RECT_ROW: {
          const seatsPerRow = Math.max(Math.round(width / 30), 2);
          const numRows = Math.max(Math.round(height / 30), 2);
          const dx = width / (seatsPerRow - 1);
          const dy = height / (numRows - 1);

          const rows = Array.from({ length: numRows }, (_, rowIndex) => {
            const seats = Array.from({ length: seatsPerRow }, (_, seatIndex) => ({
              uuid: uuidv4(),
              position: {
                x: x + seatIndex * dx,
                y: y + rowIndex * dy,
              },
              status: 'available',
              number: seatIndex + 1,
            }));

            return {
              uuid: uuidv4(),
              seats,
              rowNumber: seatingPlan.zones[0].rows.length + rowIndex + 1,
            };
          });

          currentZone.rows.push(...rows);
          break;
        }
      }

      canvasActions.addToHistory(updatedPlan);
      onPlanChange(updatedPlan);
      canvasActions.resetDrawingState();
    },
    [
      canvasState,
      currentTool,
      seatingPlan,
      zoom,
      onPlanChange,
      canvasActions,
      canvasSetters,
    ],
  );

  const handleSelect = useCallback(
    (type: 'seat' | 'row' | 'shape', id: string, event?: any) => {
      if (event) {
        event.cancelBubble = true;
      }

      switch (currentTool) {
        case EditorTool.SELECT_SEAT:
          if (type !== 'seat') return;
          break;
        case EditorTool.SELECT_ROW:
          if (type !== 'row' && type !== 'shape') return;
          break;
        default:
          return;
      }

      const newSelection = { type, ids: [id] };
      canvasSetters.setSelection(newSelection);
      onSelectionChange(newSelection);
    },
    [currentTool, onSelectionChange, canvasSetters],
  );

  const handleDragStart = useCallback(
    (id: string, type: 'seat' | 'row' | 'shape') => {
      canvasSetters.setDraggedSeatId(id);
      canvasSetters.setIsDragging(true);
      const preview = createDragPreview(seatingPlan, id, type);
      if (preview) {
        canvasSetters.setDragPreview(preview);
      }
    },
    [seatingPlan, canvasSetters],
  );

  const handleDragEnd = useCallback(
    (e: any, type: 'seat' | 'row' | 'shape') => {
      const { draggedSeatId, isDragging, dragPreview } = canvasState;
      if (!draggedSeatId || !isDragging || !dragPreview) return;

      const pos = getMousePosition(e, zoom);
      const updatedPlan = { ...seatingPlan };

      if (type === 'row') {
        const rowToMove = updatedPlan.zones[0].rows.find(
          (r) => r.uuid === draggedSeatId,
        );
        if (rowToMove) {
          const dx = pos.x - rowToMove.position.x;
          const dy = pos.y - rowToMove.position.y;
          rowToMove.position = pos;
          rowToMove.seats = rowToMove.seats.map((s) => ({
            ...s,
            position: {
              x: s.position.x + dx,
              y: s.position.y + dy,
            },
          }));
        }
      } else {
        updatedPlan.zones = updatedPlan.zones.map((z) => ({
          ...z,
          rows: z.rows.map((r) => ({
            ...r,
            seats: r.seats.map((s) =>
              s.uuid === draggedSeatId ? { ...s, position: pos } : s,
            ),
          })),
        }));
      }

      onPlanChange(updatedPlan);
      canvasActions.resetDragState();
    },
    [canvasState, seatingPlan, zoom, onPlanChange, canvasActions],
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSelect,
    handleDragStart,
    handleDragEnd,
  };
};
