import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Stage,
  Layer,
  Circle,
  Text,
  Group,
  Rect,
  Ellipse,
  Line,
} from 'react-konva';
import { SeatingPlan, EditorTool, Point, Shape, Selection } from '../../types';
import {
  createStraightRow,
  createRectangularRow,
  createShape,
  createTextLabel,
  renderRowPreview,
  renderRectRowPreview,
} from './utils';
import {
  getMousePosition,
  getSelectionBox,
  isPointInBox,
} from './utils/mouseUtils';
import GridLayer from './components/GridLayer';
import './Canvas.css';
import { v4 as uuidv4 } from 'uuid';
import { updateItemPosition, createDragPreview } from './utils/dragUtils';
import { updateSelection } from './utils/selectionUtils';

interface PreviewShape extends Partial<Shape> {
  type: Shape['type'];
  startPoint: Point;
  endPoint: Point;
}

interface CanvasProps {
  seatingPlan: SeatingPlan;
  currentTool: EditorTool;
  zoom: number;
  showGrid: boolean;
  onPlanChange: (plan: SeatingPlan) => void;
  onSelectionChange: (selection: Selection) => void;
  setCurrentTool: (tool: EditorTool) => void;
}

const GRID_SIZE = 20;

const Canvas: React.FC<CanvasProps> = ({
  seatingPlan,
  currentTool,
  zoom,
  showGrid,
  onPlanChange,
  onSelectionChange,
  setCurrentTool,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewShape, setPreviewShape] = useState<any>(null);
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>({
    type: 'none',
    ids: [],
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<{
    type: 'seat' | 'row';
    position: Point;
    seats: { uuid: string; position: Point }[];
  } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    startPoint: Point;
    endPoint: Point;
  } | null>(null);
  const [clipboard, setClipboard] = useState<{
    type: 'rows' | 'shapes' | 'seats';
    items: any[];
  } | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = useCallback(
    (e: any) => {
      if (
        currentTool === EditorTool.SELECT_ROW ||
        currentTool === EditorTool.SELECT_SEAT
      ) {
        const point = getMousePosition(e, zoom);
        if (e.target === e.target.getStage()) {
          setSelectionBox({ startPoint: point, endPoint: point });
          setSelection({ type: 'none', ids: [] });
        }
      } else {
        const point = getMousePosition(e, zoom);
        if (point) {
          setStartPoint(point);
          setIsDrawing(true);

          if (
            currentTool === EditorTool.ADD_SHAPE ||
            currentTool === EditorTool.ADD_CIRCLE ||
            currentTool === EditorTool.ADD_ELLIPSE
          ) {
            setPreviewShape({
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
        }
      }
    },
    [currentTool, zoom],
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      if (selectionBox) {
        const point = getMousePosition(e, zoom);
        setSelectionBox((prev) => ({ ...prev!, endPoint: point }));

        const newSelection = updateSelection(
          seatingPlan,
          { ...selectionBox, endPoint: point },
          currentTool === EditorTool.SELECT_SEAT ? 'seat' : 'row',
        );
        setSelection(newSelection);
      } else if (isDragging && dragPreview) {
        const pos = getMousePosition(e, zoom);
        const dx = pos.x - dragPreview.position.x;
        const dy = pos.y - dragPreview.position.y;

        setDragPreview((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            position: pos,
            seats: prev.seats.map((seat) => ({
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
          currentTool === EditorTool.ADD_SHAPE ||
          currentTool === EditorTool.ADD_CIRCLE ||
          currentTool === EditorTool.ADD_ELLIPSE ||
          currentTool === EditorTool.ADD_ROW ||
          currentTool === EditorTool.ADD_RECT_ROW
        ) {
          setPreviewShape((prev) =>
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
        }
      }
    },
    [
      selectionBox,
      currentTool,
      seatingPlan,
      isDragging,
      dragPreview,
      isDrawing,
      startPoint,
      zoom,
    ],
  );

  const handleMouseUp = useCallback(
    (e: any) => {
      if (selectionBox) {
        setSelectionBox(null);
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
        case EditorTool.ADD_SHAPE:
          const rectangle = createShape(
            'rectangle',
            { x, y },
            {
              size: { width, height },
            },
          );
          currentZone.areas = [...currentZone.areas, rectangle];
          break;

        case EditorTool.ADD_CIRCLE:
          const radius = Math.sqrt(width * width + height * height) / 2;
          const circle = createShape('circle', startPoint, { radius });
          currentZone.areas = [...currentZone.areas, circle];
          break;

        case EditorTool.ADD_ELLIPSE:
          const ellipse = createShape(
            'ellipse',
            { x: x + width / 2, y: y + height / 2 },
            {
              size: { width, height },
            },
          );
          currentZone.areas = [...currentZone.areas, ellipse];
          break;

        case EditorTool.ADD_ROW:
          const numSeats = Math.max(Math.round(width / 30), 2); // Ensure at least 2 seats
          const straightRow = createStraightRow(startPoint, endPoint, numSeats);
          currentZone.rows = [...currentZone.rows, straightRow];
          break;

        case EditorTool.ADD_RECT_ROW: {
          const seatsPerRow = Math.max(Math.round(width / 30), 2); // Ensure at least 2 seats
          const numRows = Math.max(Math.round(height / 30), 2); // Ensure at least 2 rows
          const newRows = createRectangularRow(
            { x, y },
            { width, height },
            numRows,
            seatsPerRow,
          );
          currentZone.rows = [...currentZone.rows, ...newRows];
          break;
        }
      }

      onPlanChange(updatedPlan);
      setIsDrawing(false);
      setStartPoint(null);
      setPreviewShape(null);
    },
    [isDrawing, startPoint, currentTool, seatingPlan, onPlanChange, zoom],
  );

  const handleSelect = (
    type: 'seat' | 'row' | 'shape',
    id: string,
    event?: any,
  ) => {
    if (event) {
      event.cancelBubble = true;
    }

    switch (currentTool) {
      case EditorTool.SELECT_SEAT:
        if (type !== 'seat') return; // Only allow seat selection
        break;
      case EditorTool.SELECT_ROW:
        if (type !== 'row' && type !== 'shape') return; // Only allow row or shape selection
        break;
      default:
        return; // No selection in other modes
    }

    const newSelection = { type, ids: [id] };
    setSelection(newSelection);
    onSelectionChange(newSelection);
  };

  const handleDragStart = useCallback(
    (id: string, type: 'seat' | 'row' | 'shape') => {
      setDraggedSeatId(id);
      setIsDragging(true);
      const preview = createDragPreview(seatingPlan, id, type);
      if (preview) {
        setDragPreview(preview);
      }
    },
    [seatingPlan],
  );

  const handleDragEnd = useCallback(
    (e: any, type: 'seat' | 'row' | 'shape') => {
      if (!draggedSeatId || !isDragging || !dragPreview) return;

      const pos = getMousePosition(e, zoom);
      const updatedPlan = updateItemPosition(
        seatingPlan,
        draggedSeatId,
        pos,
        type,
      );

      onPlanChange(updatedPlan);
      setDraggedSeatId(null);
      setIsDragging(false);
      setDragPreview(null);
    },
    [draggedSeatId, isDragging, dragPreview, seatingPlan, onPlanChange, zoom],
  );

  const handleSeatDoubleClick = useCallback(
    (e: any) => {
      if (currentTool === EditorTool.SELECT_ROW) {
        e.cancelBubble = true;
        setCurrentTool(EditorTool.SELECT_SEAT);
      }
    },
    [currentTool, setCurrentTool],
  );

  const renderShapes = useCallback(() => {
    return seatingPlan.zones.flatMap((zone) =>
      zone.areas.map((area) => {
        const isSelected =
          selection.type === 'shape' && selection.ids.includes(area.uuid);

        if ('text' in area) {
          return (
            <Text
              key={area.uuid}
              x={area.position.x}
              y={area.position.y}
              text={area.text}
              fontSize={area.fontSize}
              fontFamily={area.fontFamily}
              fill={area.fill}
              draggable={currentTool === EditorTool.SELECT_ROW}
              onClick={() => {
                if (currentTool === EditorTool.SELECT_ROW) {
                  handleSelect('shape', area.uuid);
                }
              }}
              onDragStart={() => setDraggedSeatId(area.uuid)}
              onDragEnd={(e) => {
                if (draggedSeatId) {
                  const pos = getMousePosition(e, zoom);
                  const updatedPlan = { ...seatingPlan };
                  updatedPlan.zones = updatedPlan.zones.map((z) => ({
                    ...z,
                    areas: z.areas.map((a) =>
                      a.uuid === draggedSeatId ? { ...a, position: pos } : a,
                    ),
                  }));
                  onPlanChange(updatedPlan);
                  setDraggedSeatId(null);
                }
              }}
            />
          );
        }

        const commonProps = {
          draggable: currentTool === EditorTool.SELECT_ROW,
          onClick: () => {
            if (currentTool === EditorTool.SELECT_ROW) {
              handleSelect('shape', area.uuid);
            }
          },
          onDragStart: () => setDraggedSeatId(area.uuid),
          onDragEnd: (e: any) => {
            if (draggedSeatId) {
              const pos = getMousePosition(e, zoom);
              const updatedPlan = { ...seatingPlan };
              updatedPlan.zones = updatedPlan.zones.map((z) => ({
                ...z,
                areas: z.areas.map((a) =>
                  a.uuid === draggedSeatId ? { ...a, position: pos } : a,
                ),
              }));
              onPlanChange(updatedPlan);
              setDraggedSeatId(null);
            }
          },
          fill: isSelected ? 'rgba(100, 150, 255, 0.5)' : area.fill || '#ddd',
          stroke: isSelected ? '#4444ff' : area.stroke || '#666',
          strokeWidth: isSelected ? 2 : 1,
        };

        switch (area.type) {
          case 'rectangle':
            return (
              <Rect
                key={area.uuid}
                x={area.position.x}
                y={area.position.y}
                width={area.size?.width || 0}
                height={area.size?.height || 0}
                {...commonProps}
              />
            );
          case 'circle':
            return (
              <Circle
                key={area.uuid}
                x={area.position.x}
                y={area.position.y}
                radius={area.radius || 0}
                {...commonProps}
              />
            );
          case 'ellipse':
            return (
              <Ellipse
                key={area.uuid}
                x={area.position.x}
                y={area.position.y}
                radiusX={area.size?.width ? area.size.width / 2 : 0}
                radiusY={area.size?.height ? area.size.height / 2 : 0}
                {...commonProps}
              />
            );
          default:
            return null;
        }
      }),
    );
  }, [
    seatingPlan.zones,
    selection,
    currentTool,
    draggedSeatId,
    onPlanChange,
    zoom,
  ]);

  const renderRows = useCallback(() => {
    return seatingPlan.zones.flatMap((zone) =>
      zone.rows.map((row) => {
        const isSelected =
          selection.type === 'row' && selection.ids.includes(row.uuid);
        const minX = Math.min(...row.seats.map((s) => s.position.x));
        const maxX = Math.max(...row.seats.map((s) => s.position.x));
        const minY = Math.min(...row.seats.map((s) => s.position.y));
        const maxY = Math.max(...row.seats.map((s) => s.position.y));
        const width = maxX - minX;
        const height = maxY - minY;

        return (
          <Group key={row.uuid}>
            <Rect
              x={minX - 10}
              y={minY - 30}
              width={width + 20}
              height={height + 40}
              fill={isSelected ? 'rgba(100, 150, 255, 0.1)' : 'transparent'}
              stroke={isSelected ? '#4444ff' : 'transparent'}
              strokeWidth={2}
              onClick={(e) => handleSelect('row', row.uuid, e)}
              onMouseEnter={(e) => {
                if (currentTool === EditorTool.SELECT_ROW) {
                  e.target.getStage().container().style.cursor = 'pointer';
                }
              }}
              onMouseLeave={(e) => {
                e.target.getStage().container().style.cursor = 'default';
              }}
              draggable={currentTool === EditorTool.SELECT_ROW}
              onDragStart={() => handleDragStart(row.uuid, 'row')}
              onDragEnd={(e) => handleDragEnd(e, 'row')}
            />

            <Text
              x={minX}
              y={minY - 25}
              text={`Row ${row.rowNumber}`}
              fontSize={14}
              fill={isSelected ? '#4444ff' : '#666'}
            />

            {row.seats.map((seat) => (
              <Circle
                key={seat.uuid}
                x={seat.position.x}
                y={seat.position.y}
                radius={seat.radius || 15}
                fill={
                  selection.type === 'seat' && selection.ids.includes(seat.uuid)
                    ? 'rgba(100, 150, 255, 0.5)'
                    : isSelected
                    ? 'rgba(100, 150, 255, 0.3)'
                    : seat.category
                    ? seatingPlan.categories.find(
                        (c) => c.name === seat.category,
                      )?.color || '#ddd'
                    : '#ddd'
                }
                stroke={
                  selection.type === 'seat' && selection.ids.includes(seat.uuid)
                    ? '#4444ff'
                    : isSelected
                    ? '#4444ff'
                    : '#666'
                }
                strokeWidth={1}
                draggable={currentTool === EditorTool.SELECT_SEAT}
                onClick={(e) => handleSelect('seat', seat.uuid, e)}
                onDblClick={handleSeatDoubleClick}
                onMouseEnter={(e) => {
                  if (currentTool === EditorTool.SELECT_SEAT) {
                    e.target.getStage().container().style.cursor = 'pointer';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.getStage().container().style.cursor = 'default';
                }}
                onDragStart={() => handleDragStart(seat.uuid, 'seat')}
                onDragEnd={(e) => handleDragEnd(e, 'seat')}
              />
            ))}

            {row.seats.map((seat) => (
              <Text
                key={`${seat.uuid}-number`}
                x={seat.position.x}
                y={seat.position.y}
                text={seat.number.toString()}
                fontSize={12}
                fill="#000"
                align="center"
                verticalAlign="middle"
                offsetX={4}
                offsetY={6}
              />
            ))}
          </Group>
        );
      }),
    );
  }, [
    seatingPlan.zones,
    selection,
    currentTool,
    draggedSeatId,
    onPlanChange,
    zoom,
  ]);

  const renderSeats = useCallback(() => {
    return seatingPlan.zones.flatMap((zone) =>
      zone.rows.flatMap((row) =>
        row.seats.map((seat) => (
          <Group key={seat.uuid}>
            <Circle
              x={seat.position.x}
              y={seat.position.y}
              radius={seat.radius || 15}
              fill={
                selection.ids.includes(seat.uuid)
                  ? 'rgba(100, 150, 255, 0.5)'
                  : seat.category
                  ? seatingPlan.categories.find((c) => c.name === seat.category)
                      ?.color || '#ddd'
                  : '#ddd'
              }
              stroke={selection.ids.includes(seat.uuid) ? '#4444ff' : '#666'}
              strokeWidth={selection.ids.includes(seat.uuid) ? 2 : 1}
              draggable={currentTool === EditorTool.SELECT_SEAT}
              onClick={() => {
                if (currentTool === EditorTool.SELECT_SEAT) {
                  handleSelect('seat', seat.uuid);
                }
              }}
              onDragStart={(e) => {
                if (selection.type === 'row') {
                  setDraggedSeatId(row.uuid);
                } else {
                  setDraggedSeatId(seat.uuid);
                }
              }}
              onDragEnd={(e) => {
                if (draggedSeatId) {
                  const pos = getMousePosition(e, zoom);
                  const updatedPlan = { ...seatingPlan };

                  if (selection.type === 'row') {
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
                          s.uuid === draggedSeatId
                            ? { ...s, position: pos }
                            : s,
                        ),
                      })),
                    }));
                  }

                  onPlanChange(updatedPlan);
                  setDraggedSeatId(null);
                }
              }}
            />
            {typeof seat.number === 'number' && (
              <Text
                x={seat.position.x}
                y={seat.position.y}
                text={seat.number.toString()}
                fontSize={12}
                fill="#000"
              />
            )}
          </Group>
        )),
      ),
    );
  }, [seatingPlan, selection, currentTool, draggedSeatId, onPlanChange, zoom]);

  const renderPreviewShape = useCallback(() => {
    if (!previewShape || !startPoint) return null;

    const commonProps = {
      fill: 'rgba(200, 200, 200, 0.5)',
      stroke: '#666',
      strokeWidth: 1,
      dash: [5, 5],
    };

    switch (currentTool) {
      case EditorTool.ADD_SHAPE:
        const width = Math.abs(previewShape.endPoint.x - startPoint.x);
        const height = Math.abs(previewShape.endPoint.y - startPoint.y);
        const x = Math.min(startPoint.x, previewShape.endPoint.x);
        const y = Math.min(startPoint.y, previewShape.endPoint.y);
        return (
          <Rect x={x} y={y} width={width} height={height} {...commonProps} />
        );

      case EditorTool.ADD_CIRCLE: {
        const radius = Math.sqrt(
          Math.pow(previewShape.endPoint.x - startPoint.x, 2) +
          Math.pow(previewShape.endPoint.y - startPoint.y, 2)
        ) / 2;
        return (
          <Circle
            x={startPoint.x}
            y={startPoint.y}
            radius={radius}
            {...commonProps}
          />
        );
      }

      case EditorTool.ADD_ELLIPSE: {
        const width = Math.abs(previewShape.endPoint.x - startPoint.x);
        const height = Math.abs(previewShape.endPoint.y - startPoint.y);
        const x = Math.min(startPoint.x, previewShape.endPoint.x);
        const y = Math.min(startPoint.y, previewShape.endPoint.y);
        return (
          <Ellipse
            x={x + width / 2}
            y={y + height / 2}
            radiusX={width / 2}
            radiusY={height / 2}
            {...commonProps}
          />
        );
      }

      case EditorTool.ADD_ROW: {
        const preview = renderRowPreview(startPoint, previewShape.endPoint, commonProps);
        return (
          <Group>
            <Line points={preview.linePoints} {...commonProps} />
            {preview.seatPositions.map((pos, i) => (
              <Circle key={i} x={pos.x} y={pos.y} radius={15} {...commonProps} />
            ))}
          </Group>
        );
      }

      case EditorTool.ADD_RECT_ROW: {
        const preview = renderRectRowPreview(startPoint, previewShape.endPoint);
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
  }, [previewShape, startPoint, currentTool]);

  const renderSelectionBox = () => {
    if (!selectionBox) return null;

    const { startPoint, endPoint } = selectionBox;
    return (
      <Rect
        x={Math.min(startPoint.x, endPoint.x)}
        y={Math.min(startPoint.y, endPoint.y)}
        width={Math.abs(endPoint.x - startPoint.x)}
        height={Math.abs(endPoint.y - startPoint.y)}
        fill="rgba(0, 100, 255, 0.1)"
        stroke="#0066ff"
        strokeWidth={1}
        dash={[5, 5]}
      />
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selection.ids.length) return;

      // Delete: Delete selected items
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const updatedPlan = { ...seatingPlan };

        switch (selection.type) {
          case 'seat':
            updatedPlan.zones[0].rows = updatedPlan.zones[0].rows.map(
              (row) => ({
                ...row,
                seats: row.seats.filter(
                  (seat) => !selection.ids.includes(seat.uuid),
                ),
              }),
            );
            break;
          case 'row':
            updatedPlan.zones[0].rows = updatedPlan.zones[0].rows.filter(
              (row) => !selection.ids.includes(row.uuid),
            );
            updatedPlan.zones[0].areas = updatedPlan.zones[0].areas.filter(
              (area) => !selection.ids.includes(area.uuid),
            );
            break;
        }

        onPlanChange(updatedPlan);
        setSelection({ type: 'none', ids: [] });
      }

      // Copy: Ctrl/Cmd + C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        switch (selection.type) {
          case 'seat': {
            const selectedSeats = seatingPlan.zones[0].rows.flatMap((row) =>
              row.seats.filter((seat) => selection.ids.includes(seat.uuid)),
            );
            setClipboard({
              type: 'seats',
              items: JSON.parse(JSON.stringify(selectedSeats)),
            });
            break;
          }
          case 'row': {
            const selectedItems = [
              ...seatingPlan.zones[0].rows.filter((row) =>
                selection.ids.includes(row.uuid),
              ),
              ...seatingPlan.zones[0].areas.filter((area) =>
                selection.ids.includes(area.uuid),
              ),
            ];
            setClipboard({
              type: selection.type,
              items: JSON.parse(JSON.stringify(selectedItems)),
            });
            break;
          }
        }
      }

      // Cut: Ctrl/Cmd + X
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        const updatedPlan = { ...seatingPlan };

        switch (selection.type) {
          case 'seat': {
            const selectedSeats = seatingPlan.zones[0].rows.flatMap((row) =>
              row.seats.filter((seat) => selection.ids.includes(seat.uuid)),
            );
            setClipboard({
              type: 'seats',
              items: JSON.parse(JSON.stringify(selectedSeats)),
            });

            updatedPlan.zones[0].rows = updatedPlan.zones[0].rows.map(
              (row) => ({
                ...row,
                seats: row.seats.filter(
                  (seat) => !selection.ids.includes(seat.uuid),
                ),
              }),
            );
            break;
          }
          case 'row': {
            const selectedItems = [
              ...seatingPlan.zones[0].rows.filter((row) =>
                selection.ids.includes(row.uuid),
              ),
              ...seatingPlan.zones[0].areas.filter((area) =>
                selection.ids.includes(area.uuid),
              ),
            ];
            setClipboard({
              type: selection.type,
              items: JSON.parse(JSON.stringify(selectedItems)),
            });

            updatedPlan.zones[0].rows = updatedPlan.zones[0].rows.filter(
              (row) => !selection.ids.includes(row.uuid),
            );
            updatedPlan.zones[0].areas = updatedPlan.zones[0].areas.filter(
              (area) => !selection.ids.includes(area.uuid),
            );
            break;
          }
        }

        onPlanChange(updatedPlan);
        setSelection({ type: 'none', ids: [] });
      }

      // Paste: Ctrl/Cmd + V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        if (!clipboard) return;

        const updatedPlan = { ...seatingPlan };
        const offset = { x: 30, y: 30 }; // Offset pasted items for visibility

        switch (clipboard.type) {
          case 'seats': {
            const newSeats = clipboard.items.map((seat) => ({
              ...seat,
              uuid: uuidv4(),
              position: {
                x: seat.position.x + offset.x,
                y: seat.position.y + offset.y,
              },
            }));

            // Create a new row for the pasted seats
            const newRow = {
              uuid: uuidv4(),
              rowNumber:
                Math.max(
                  ...updatedPlan.zones[0].rows.map((r) => r.rowNumber),
                  0,
                ) + 1,
              seats: newSeats,
            };
            updatedPlan.zones[0].rows.push(newRow);
            break;
          }
          case 'row': {
            const newItems = clipboard.items.map((item) => {
              if ('seats' in item) {
                // It's a row
                return {
                  ...item,
                  uuid: uuidv4(),
                  seats: item.seats.map((seat) => ({
                    ...seat,
                    uuid: uuidv4(),
                    position: {
                      x: seat.position.x + offset.x,
                      y: seat.position.y + offset.y,
                    },
                  })),
                };
              } else {
                // It's a shape
                return {
                  ...item,
                  uuid: uuidv4(),
                  position: {
                    x: item.position.x + offset.x,
                    y: item.position.y + offset.y,
                  },
                };
              }
            });

            // Separate rows and shapes
            const newRows = newItems.filter((item) => 'seats' in item);
            const newShapes = newItems.filter((item) => !('seats' in item));

            updatedPlan.zones[0].rows.push(...newRows);
            updatedPlan.zones[0].areas.push(...newShapes);
            break;
          }
        }

        onPlanChange(updatedPlan);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, seatingPlan, onPlanChange, clipboard, zoom]);

  return (
    <div ref={containerRef} className="canvas-container">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        scale={{ x: zoom, y: zoom }}
      >
        <GridLayer
          stageSize={stageSize}
          gridSize={GRID_SIZE}
          zoom={zoom}
          visible={showGrid}
        />

        {/* Main drawing layer */}
        <Layer>
          {/* Render shapes */}
          {renderShapes()}
          {/* Render rows */}
          {renderRows()}
          {/* Render preview shape */}
          {renderPreviewShape()}
          {/* Render selection box */}
          {renderSelectionBox()}
          {/* Render drag preview */}
          {dragPreview && (
            <Group opacity={0.6}>
              {dragPreview.seats.map((seat) => (
                <React.Fragment key={seat.uuid}>
                  <Circle
                    x={seat.position.x}
                    y={seat.position.y}
                    radius={15}
                    fill="rgba(100, 150, 255, 0.5)"
                    stroke="#4444ff"
                    strokeWidth={1}
                  />
                  <Text
                    x={seat.position.x}
                    y={seat.position.y}
                    text={
                      seatingPlan.zones[0].rows
                        .flatMap((row) => row.seats)
                        .find((s) => s.uuid === seat.uuid)
                        ?.number.toString() || ''
                    }
                    fontSize={12}
                    fill="#000"
                    align="center"
                    verticalAlign="middle"
                    offsetX={4}
                    offsetY={6}
                  />
                </React.Fragment>
              ))}
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
