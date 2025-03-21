import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Circle, Text, Group, Rect, Ellipse, Line } from 'react-konva';
import { SeatingPlan, EditorTool, Point, Shape } from '../../types';
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
}

const GRID_SIZE = 20;

const Canvas: React.FC<CanvasProps> = ({
  seatingPlan,
  currentTool,
  zoom,
  showGrid,
  onPlanChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewShape, setPreviewShape] = useState<PreviewShape | null>(null);
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);

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
    return showGrid
      ? snapToGrid({
          x: point.x / zoom,
          y: point.y / zoom,
        }, GRID_SIZE)
      : {
          x: point.x / zoom,
          y: point.y / zoom,
        };
  };

  const handleMouseDown = useCallback(
    (e: any) => {
      if (e.target === e.target.getStage()) {
        const point = getMousePosition(e);
        setStartPoint(point);
        setIsDrawing(true);

        if (currentTool === EditorTool.ADD_SHAPE || 
            currentTool === EditorTool.ADD_CIRCLE ||
            currentTool === EditorTool.ADD_ELLIPSE) {
          setPreviewShape({
            type: currentTool === EditorTool.ADD_CIRCLE ? 'circle' :
                  currentTool === EditorTool.ADD_ELLIPSE ? 'ellipse' : 'rectangle',
            startPoint: point,
            endPoint: point,
          });
        }
      }
    },
    [currentTool, showGrid, zoom],
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      if (isDrawing && startPoint) {
        const currentPoint = getMousePosition(e);

        if (currentTool === EditorTool.ADD_SHAPE ||
            currentTool === EditorTool.ADD_CIRCLE ||
            currentTool === EditorTool.ADD_ELLIPSE) {
          setPreviewShape((prev) =>
            prev ? { ...prev, endPoint: currentPoint } : null
          );
        }
      }
    },
    [isDrawing, startPoint, currentTool, showGrid, zoom],
  );

  const handleMouseUp = useCallback(
    (e: any) => {
      if (!isDrawing || !startPoint) return;

      const endPoint = getMousePosition(e);
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      const x = Math.min(startPoint.x, endPoint.x);
      const y = Math.min(startPoint.y, endPoint.y);

      const updatedPlan = { ...seatingPlan };
      const currentZone = updatedPlan.zones[0]; // For now, we'll work with the first zone

      switch (currentTool) {
        case EditorTool.ADD_SHAPE:
          const rectangle = createShape('rectangle', { x, y }, {
            size: { width, height }
          });
          currentZone.areas = [...currentZone.areas, rectangle];
          break;

        case EditorTool.ADD_CIRCLE:
          const radius = Math.sqrt(width * width + height * height) / 2;
          const circle = createShape('circle', startPoint, { radius });
          currentZone.areas = [...currentZone.areas, circle];
          break;

        case EditorTool.ADD_ELLIPSE:
          const ellipse = createShape('ellipse', { x: x + width / 2, y: y + height / 2 }, {
            size: { width, height }
          });
          currentZone.areas = [...currentZone.areas, ellipse];
          break;

        case EditorTool.ADD_ROW:
          const numSeats = Math.max(Math.round(width / 30), 1); // Approximate seat width of 30
          const straightRow = createStraightRow(startPoint, endPoint, numSeats);
          currentZone.rows = [...currentZone.rows, straightRow];
          break;

        case EditorTool.ADD_RECT_ROW:
          const seatsPerRow = Math.max(Math.round(width / 30), 1);
          const numRows = Math.max(Math.round(height / 30), 1);
          const rectRow = createRectangularRow(
            { x, y },
            { width, height },
            numRows,
            seatsPerRow
          );
          currentZone.rows = [...currentZone.rows, rectRow];
          break;
      }

      onPlanChange(updatedPlan);
      setIsDrawing(false);
      setStartPoint(null);
      setPreviewShape(null);
    },
    [isDrawing, startPoint, currentTool, seatingPlan, onPlanChange],
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
        />
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
        />
      );
    }

    return gridLines;
  };

  const renderPreviewShape = () => {
    if (!previewShape || !startPoint) return null;

    const width = Math.abs(previewShape.endPoint.x - previewShape.startPoint.x);
    const height = Math.abs(previewShape.endPoint.y - previewShape.startPoint.y);
    const x = Math.min(previewShape.startPoint.x, previewShape.endPoint.x);
    const y = Math.min(previewShape.startPoint.y, previewShape.endPoint.y);

    switch (previewShape.type) {
      case 'rectangle':
        return (
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(200, 200, 200, 0.5)"
            stroke="#666"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      case 'circle':
        const radius = Math.sqrt(width * width + height * height) / 2;
        return (
          <Circle
            x={startPoint.x}
            y={startPoint.y}
            radius={radius}
            fill="rgba(200, 200, 200, 0.5)"
            stroke="#666"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      case 'ellipse':
        return (
          <Ellipse
            x={x + width / 2}
            y={y + height / 2}
            radiusX={width / 2}
            radiusY={height / 2}
            fill="rgba(200, 200, 200, 0.5)"
            stroke="#666"
            strokeWidth={1}
            dash={[5, 5]}
          />
        );
      default:
        return null;
    }
  };

  const renderShapes = useCallback(() => {
    return seatingPlan.zones.flatMap((zone) =>
      zone.areas.map((area) => {
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
            />
          );
        }

        switch (area.type) {
          case 'rectangle':
            return (
              <Rect
                key={area.uuid}
                x={area.position.x}
                y={area.position.y}
                width={area.size?.width || 0}
                height={area.size?.height || 0}
                fill={area.fill}
                stroke={area.stroke}
              />
            );
          case 'circle':
            return (
              <Circle
                key={area.uuid}
                x={area.position.x}
                y={area.position.y}
                radius={area.radius || 0}
                fill={area.fill}
                stroke={area.stroke}
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
                fill={area.fill}
                stroke={area.stroke}
              />
            );
          default:
            return null;
        }
      }),
    );
  }, [seatingPlan.zones]);

  const renderSeats = useCallback(() => {
    return seatingPlan.zones.flatMap((zone) =>
      zone.rows.flatMap((row) =>
        row.seats.map((seat) => (
          <Circle
            key={seat.uuid}
            x={seat.position.x}
            y={seat.position.y}
            radius={15}
            fill={
              seat.category
                ? seatingPlan.categories.find((c) => c.name === seat.category)?.color
                : '#ddd'
            }
            stroke="#666"
            draggable
            onDragStart={(e) => {
              setDraggedSeatId(seat.uuid);
            }}
            onDragEnd={(e) => {
              if (draggedSeatId) {
                const pos = getMousePosition(e);
                const updatedPlan = { ...seatingPlan };
                updatedPlan.zones = updatedPlan.zones.map((z) => ({
                  ...z,
                  rows: z.rows.map((r) => ({
                    ...r,
                    seats: r.seats.map((s) =>
                      s.uuid === draggedSeatId
                        ? { ...s, position: pos }
                        : s
                    ),
                  })),
                }));
                onPlanChange(updatedPlan);
                setDraggedSeatId(null);
              }
            }}
          />
        )),
      ),
    );
  }, [seatingPlan, draggedSeatId, onPlanChange]);

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
        <Layer>
          {showGrid && renderGrid()}
          {renderShapes()}
          {renderSeats()}
          {previewShape && renderPreviewShape()}
          {/* Background */}
          {seatingPlan.backgroundImage && (
            <Rect
              width={seatingPlan.size.width}
              height={seatingPlan.size.height}
              fillPatternImage={new Image()}
              fillPatternScaleX={1 / zoom}
              fillPatternScaleY={1 / zoom}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
