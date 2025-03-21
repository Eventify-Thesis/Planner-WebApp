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
  createCircularRow,
  createStraightRow,
  createRectangularRow,
  createShape,
  createTextLabel,
  snapToGrid,
} from './utils';
import './Canvas.css';

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

  const getMousePosition = (event: any): Point => {
    const stage = event.target.getStage();
    const point = stage.getPointerPosition();
    return {
      x: point.x / zoom,
      y: point.y / zoom,
    };
  };

  const handleMouseDown = useCallback(
    (e: any) => {
      const point = getMousePosition(e);
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
    },
    [currentTool, getMousePosition],
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      if (isDrawing && startPoint) {
        const currentPoint = getMousePosition(e);
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
    [isDrawing, startPoint, currentTool, getMousePosition],
  );

  const handleMouseUp = useCallback(
    (e: any) => {
      if (!isDrawing || !startPoint) return;

      const endPoint = getMousePosition(e);
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
    [
      isDrawing,
      startPoint,
      currentTool,
      seatingPlan,
      onPlanChange,
      getMousePosition,
    ],
  );

  const handleSelect = (
    type: 'seat' | 'row' | 'shape',
    id: string,
    event?: any,
  ) => {
    if (event) {
      event.cancelBubble = true;
    }

    // Handle selection based on current tool
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

  const handleDragStart = (id: string, type: 'seat' | 'row' | 'shape') => {
    // Check if we can drag based on current tool and element type
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

    setDraggedSeatId(id);
    setIsDragging(true);

    // Create drag preview
    if (type === 'seat') {
      const seat = seatingPlan.zones[0].rows
        .flatMap((row) => row.seats)
        .find((seat) => seat.uuid === id);
      if (seat) {
        setDragPreview({
          type: 'seat',
          position: seat.position,
          seats: [{ uuid: seat.uuid, position: seat.position }],
        });
      }
    } else if (type === 'row') {
      const row = seatingPlan.zones[0].rows.find((row) => row.uuid === id);
      if (row) {
        setDragPreview({
          type: 'row',
          position: row.seats[0].position,
          seats: row.seats.map((seat) => ({
            uuid: seat.uuid,
            position: seat.position,
          })),
        });
      }
    }

    // If the dragged item isn't selected, select it
    if (!selection.ids.includes(id) || selection.type !== type) {
      handleSelect(type, id);
    }
  };

  const handleDragMove = useCallback(
    (e: any) => {
      if (!isDragging || !dragPreview) return;

      const pos = getMousePosition(e);
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
    },
    [isDragging, dragPreview, getMousePosition],
  );

  const handleDragEnd = (e: any, type: 'seat' | 'row' | 'shape') => {
    if (!draggedSeatId || !isDragging) return;

    const pos = getMousePosition(e);
    const updatedPlan = { ...seatingPlan };

    switch (type) {
      case 'seat':
        // Update individual seat position
        updatedPlan.zones = updatedPlan.zones.map((zone) => ({
          ...zone,
          rows: zone.rows.map((row) => ({
            ...row,
            seats: row.seats.map((seat) =>
              seat.uuid === draggedSeatId ? { ...seat, position: pos } : seat,
            ),
          })),
        }));
        break;

      case 'row':
        // Update all seats in the row
        const rowToMove = updatedPlan.zones[0].rows.find(
          (r) => r.uuid === draggedSeatId,
        );
        if (rowToMove) {
          const firstSeat = rowToMove.seats[0];
          const dx = pos.x - firstSeat.position.x;
          const dy = pos.y - firstSeat.position.y;

          updatedPlan.zones = updatedPlan.zones.map((zone) => ({
            ...zone,
            rows: zone.rows.map((row) =>
              row.uuid === draggedSeatId
                ? {
                    ...row,
                    seats: row.seats.map((seat) => ({
                      ...seat,
                      position: {
                        x: seat.position.x + dx,
                        y: seat.position.y + dy,
                      },
                    })),
                  }
                : row,
            ),
          }));
        }
        break;
    }

    onPlanChange(updatedPlan);
    setDraggedSeatId(null);
    setIsDragging(false);
    setDragPreview(null);
  };

  const handleSeatDoubleClick = useCallback(
    (e: any) => {
      if (currentTool === EditorTool.SELECT_ROW) {
        e.cancelBubble = true;
        setCurrentTool(EditorTool.SELECT_SEAT);
      }
    },
    [currentTool, setCurrentTool],
  );

  const renderGrid = () => {
    if (!showGrid) return null;

    const gridLines = [];
    const width = seatingPlan.size.width;
    const height = seatingPlan.size.height;

    // Vertical lines
    for (let x = 0; x <= width; x += GRID_SIZE) {
      gridLines.push(
        <Line
          key={`v${x}`}
          points={[x, 0, x, height]}
          stroke="#ddd"
          strokeWidth={0.5}
        />,
      );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += GRID_SIZE) {
      gridLines.push(
        <Line
          key={`h${y}`}
          points={[0, y, width, y]}
          stroke="#ddd"
          strokeWidth={0.5}
        />,
      );
    }

    return gridLines;
  };

  const renderPreviewShape = () => {
    if (!previewShape || !startPoint) return null;

    const width = Math.abs(previewShape.endPoint.x - previewShape.startPoint.x);
    const height = Math.abs(
      previewShape.endPoint.y - previewShape.startPoint.y,
    );
    const x = Math.min(previewShape.startPoint.x, previewShape.endPoint.x);
    const y = Math.min(previewShape.startPoint.y, previewShape.endPoint.y);

    const commonProps = {
      fill: 'rgba(200, 200, 200, 0.5)',
      stroke: '#666',
      strokeWidth: 1,
      dash: [5, 5],
    };

    switch (currentTool) {
      case EditorTool.ADD_SHAPE:
        return (
          <Rect x={x} y={y} width={width} height={height} {...commonProps} />
        );

      case EditorTool.ADD_CIRCLE: {
        const radius = Math.sqrt(width * width + height * height) / 2;
        return (
          <Circle
            x={startPoint.x}
            y={startPoint.y}
            radius={radius}
            {...commonProps}
          />
        );
      }

      case EditorTool.ADD_ELLIPSE:
        return (
          <Ellipse
            x={x + width / 2}
            y={y + height / 2}
            radiusX={width / 2}
            radiusY={height / 2}
            {...commonProps}
          />
        );

      case EditorTool.ADD_ROW: {
        const numSeats = Math.max(Math.round(width / 30), 1);
        const dx =
          (previewShape.endPoint.x - startPoint.x) / (numSeats - 1 || 1);
        const dy =
          (previewShape.endPoint.y - startPoint.y) / (numSeats - 1 || 1);

        return (
          <Group>
            <Line
              points={[
                startPoint.x,
                startPoint.y,
                previewShape.endPoint.x,
                previewShape.endPoint.y,
              ]}
              {...commonProps}
            />
            {Array.from({ length: numSeats }).map((_, i) => (
              <Circle
                key={i}
                x={startPoint.x + dx * i}
                y={startPoint.y + dy * i}
                radius={15}
                {...commonProps}
              />
            ))}
          </Group>
        );
      }

      case EditorTool.ADD_RECT_ROW: {
        const seatsPerRow = Math.max(Math.round(width / 30), 1);
        const numRows = Math.max(Math.round(height / 30), 1);
        const dx = width / (seatsPerRow - 1 || 1);
        const dy = height / (numRows - 1 || 1);

        return (
          <Group>
            {/* Preview grid lines */}
            {Array.from({ length: numRows + 1 }).map((_, row) => (
              <Line
                key={`row-${row}`}
                points={[x, y + dy * row, x + width, y + dy * row]}
                {...commonProps}
              />
            ))}

            {/* Preview seats */}
            {Array.from({ length: numRows }).map((_, row) =>
              Array.from({ length: seatsPerRow }).map((_, col) => (
                <Circle
                  key={`${row}-${col}`}
                  x={x + dx * col}
                  y={y + dy * row}
                  radius={15}
                  {...commonProps}
                />
              )),
            )}
          </Group>
        );
      }

      default:
        return null;
    }
  };

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
                  const pos = getMousePosition(e);
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
              const pos = getMousePosition(e);
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
  }, [seatingPlan.zones, selection, currentTool, draggedSeatId, onPlanChange]);

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
            {/* Row selection area */}
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

            {/* Row label */}
            <Text
              x={minX}
              y={minY - 25}
              text={`Row ${row.rowNumber}`}
              fontSize={14}
              fill={isSelected ? '#4444ff' : '#666'}
            />

            {/* Row seats */}
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

            {/* Seat numbers */}
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
  }, [seatingPlan.zones, selection, currentTool, draggedSeatId, onPlanChange]);

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
                  const pos = getMousePosition(e);
                  const updatedPlan = { ...seatingPlan };

                  if (selection.type === 'row') {
                    // Move entire row
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
                    // Move single seat
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
                x={seat.position.x - 6}
                y={seat.position.y - 6}
                text={seat.number.toString()}
                fontSize={12}
                fill="#000"
              />
            )}
          </Group>
        )),
      ),
    );
  }, [seatingPlan, selection, currentTool, draggedSeatId, onPlanChange]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          handleMouseMove(e);
          if (isDragging) {
            handleDragMove(e);
          }
        }}
        onMouseUp={handleMouseUp}
        scale={{ x: zoom, y: zoom }}
      >
        <Layer>
          {renderGrid()}
          {renderShapes()}
          {renderRows()}
          {renderPreviewShape()}
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
