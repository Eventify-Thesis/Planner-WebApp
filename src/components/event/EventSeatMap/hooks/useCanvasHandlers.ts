import { useCallback, useState, useEffect } from 'react';
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
  // Add clipboard state
  const [clipboardItems, setClipboardItems] = useState<{
    type: 'seat' | 'row' | 'shape';
    items: any[];
  } | null>(null);

  const handleCopy = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const { selection } = canvasState;
        if (!selection || !selection.ids.length) return;

        const items = selection.ids
          .map((id) => {
            if (selection.type === 'row') {
              return seatingPlan.zones[0].rows.find((r) => r.uuid === id);
            } else if (selection.type === 'seat') {
              let foundSeat;
              seatingPlan.zones[0].rows.some((row) => {
                foundSeat = row.seats.find((s) => s.uuid === id);
                return !!foundSeat;
              });
              return foundSeat;
            } else if (selection.type === 'shape') {
              return seatingPlan.zones[0].areas.find((a) => a.uuid === id);
            }
            return null;
          })
          .filter(Boolean);

        if (items.length) {
          setClipboardItems({
            type: selection.type,
            items: items,
          });
        }
      }
    },
    [canvasState, seatingPlan],
  );

  const handlePaste = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardItems) {
        const updatedPlan = { ...seatingPlan };
        const currentZone = updatedPlan.zones[0];
        const newIds: string[] = [];

        const offset = 30; // Offset for pasted items

        if (clipboardItems.type === 'row') {
          clipboardItems.items.forEach((row: any) => {
            const newRow = {
              ...row,
              uuid: uuidv4(),
              seats: row.seats.map((seat: any) => ({
                ...seat,
                uuid: uuidv4(),
                position: {
                  x: seat.position.x + offset,
                  y: seat.position.y + offset,
                },
              })),
            };
            currentZone.rows.push(newRow);
            newIds.push(newRow.uuid);
          });
        } else if (clipboardItems.type === 'seat') {
          const newRow = {
            uuid: uuidv4(),
            seats: clipboardItems.items.map((seat: any) => ({
              ...seat,
              uuid: uuidv4(),
              position: {
                x: seat.position.x + offset,
                y: seat.position.y + offset,
              },
            })),
            rowNumber: currentZone.rows.length + 1,
          };
          currentZone.rows.push(newRow);
          newIds.push(...newRow.seats.map((s) => s.uuid));
        } else if (clipboardItems.type === 'shape') {
          clipboardItems.items.forEach((shape: any) => {
            const newShape = {
              ...shape,
              uuid: uuidv4(),
              position: {
                x: shape.position.x + offset,
                y: shape.position.y + offset,
              },
            };
            currentZone.areas.push(newShape);
            newIds.push(newShape.uuid);
          });
        }

        if (newIds.length) {
          onPlanChange(updatedPlan);
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: [],
              shapes: [],
            },
            ids: newIds,
          });
        }
      }
    },
    [clipboardItems, seatingPlan, onPlanChange, canvasSetters],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleCopy);
    window.addEventListener('keydown', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleCopy);
      window.removeEventListener('keydown', handlePaste);
    };
  }, [handleCopy, handlePaste]);

  const initializePreviewShape = useCallback(
    (point: Point) => {
      if (
        currentTool === EditorTool.ADD_SHAPE ||
        currentTool === EditorTool.ADD_CIRCLE ||
        currentTool === EditorTool.ADD_ELLIPSE ||
        currentTool === EditorTool.ADD_TEXT ||
        currentTool === EditorTool.ADD_POLYGON
      ) {
        canvasSetters.setPreviewShape({
          type:
            currentTool === EditorTool.ADD_CIRCLE
              ? 'circle'
              : currentTool === EditorTool.ADD_ELLIPSE
              ? 'ellipse'
              : currentTool === EditorTool.ADD_TEXT
              ? 'text'
              : currentTool === EditorTool.ADD_POLYGON
              ? 'polygon'
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
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: [],
              shapes: [],
            },
            ids: [],
          });
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
          EditorTool.ADD_TEXT,
          EditorTool.ADD_POLYGON,
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
                    : currentTool === EditorTool.ADD_TEXT
                    ? 'text'
                    : currentTool === EditorTool.ADD_POLYGON
                    ? 'polygon'
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
            EditorTool.ADD_TEXT,
            EditorTool.ADD_POLYGON,
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

      // Handle selection box
      if (selectionBox) {
        const endPoint = getMousePosition(e, zoom);
        if (!endPoint) {
          canvasSetters.setSelectionBox(null);
          return;
        }

        // Update selection based on selection box
        const selection = updateSelection(
          seatingPlan,
          {
            startPoint: selectionBox.startPoint,
            endPoint,
          },
          currentTool === EditorTool.SELECT_SEAT ? 'seat' : 'row',
        );

        onSelectionChange(selection);
        canvasSetters.setSelectionBox(null);
        return;
      }

      // Handle drawing
      if (!isDrawing || !startPoint) {
        return;
      }

      const endPoint = getMousePosition(e, zoom);
      if (!endPoint) {
        canvasActions.resetDrawingState();
        return;
      }

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
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: [],
              shapes: [shape.uuid],
            },
          });
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
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: [],
              shapes: [shape.uuid],
            },
          });
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
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: [],
              shapes: [shape.uuid],
            },
          });
          break;
        }

        case EditorTool.ADD_TEXT: {
          const shape = {
            uuid: uuidv4(),
            type: 'text',
            position: { x, y },
            text: 'Double click to edit',
            fontSize: 16,
            fontFamily: 'Arial',
            fill: '#000000',
          };
          currentZone.areas.push(shape);
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: [],
              shapes: [shape.uuid],
            },
          });
          break;
        }

        case EditorTool.ADD_POLYGON: {
          const points = [
            x,
            y,
            x + width,
            y,
            x + width,
            y + height,
            x,
            y + height,
          ];
          const shape = {
            uuid: uuidv4(),
            type: 'polygon',
            position: { x: 0, y: 0 },
            points,
          };
          currentZone.areas.push(shape);
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: [],
              shapes: [shape.uuid],
            },
          });
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
            rowNumber: 1, // Each new row starts with 1
          };
          currentZone.rows.push(row);
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: [row.uuid],
              shapes: [],
            },
          });
          break;
        }

        case EditorTool.ADD_RECT_ROW: {
          const seatsPerRow = Math.max(Math.round(width / 30), 2);
          const numRows = Math.max(Math.round(height / 30), 2);
          const dx = width / (seatsPerRow - 1);
          const dy = height / (numRows - 1);

          const rows = Array.from({ length: numRows }, (_, rowIndex) => {
            const seats = Array.from(
              { length: seatsPerRow },
              (_, seatIndex) => ({
                uuid: uuidv4(),
                position: {
                  x: x + seatIndex * dx,
                  y: y + rowIndex * dy,
                },
                status: 'available',
                number: seatIndex + 1,
              }),
            );

            return {
              uuid: uuidv4(),
              seats,
              rowNumber: rowIndex + 1, // Each row in the rectangle gets sequential numbers starting from 1
            };
          });

          currentZone.rows.push(...rows);
          canvasSetters.setSelection({
            selectedItems: {
              seats: [],
              rows: rows.map((r) => r.uuid),
              shapes: [],
            },
          });
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

      const newSelection = {
        selectedItems: {
          seats: type === 'seat' ? [id] : [],
          rows: type === 'row' ? [id] : [],
          shapes: type === 'shape' ? [id] : [],
        },
      };

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
          // Calculate offset based on first seat position since row doesn't have direct position
          const firstSeat = rowToMove.seats[0];
          if (!firstSeat) return;

          const dx = pos.x - firstSeat.position.x;
          const dy = pos.y - firstSeat.position.y;

          // Update all seats in the row
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
