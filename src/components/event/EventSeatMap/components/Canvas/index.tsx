import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Text,
  Group,
  Transformer,
  Line,
} from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { SeatingPlan, EditorTool, Row, Seat, Position, Area } from '../../types';
import './Canvas.css';

interface CanvasProps {
  seatingPlan: SeatingPlan;
  currentTool: EditorTool;
  zoom: number;
  onChange: (plan: SeatingPlan) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  seatingPlan,
  currentTool,
  zoom,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 });
  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Position | null>(null);
  const [previewShape, setPreviewShape] = useState<any>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (transformerRef.current && selectedIds.length > 0) {
      const nodes = selectedIds.map(
        (id) => layerRef.current?.findOne(`#${id}`),
      ).filter(Boolean);
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  const createCircularRow = (
    center: Position,
    radius: number,
    numSeats: number,
  ) => {
    const seats: Seat[] = [];
    const angleStep = (2 * Math.PI) / numSeats;

    for (let i = 0; i < numSeats; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);

      seats.push({
        uuid: uuidv4(),
        seat_number: (i + 1).toString(),
        seat_guid: uuidv4(),
        position: { x, y },
        category: '',
        radius: 11,
      });
    }

    const row: Row = {
      uuid: uuidv4(),
      row_number: (seatingPlan.zones[0].rows.length + 1).toString(),
      row_number_position: 'both',
      position: center,
      seats,
    };

    return row;
  };

  const createArea = (start: Position, end: Position): Area => {
    const width = end.x - start.x;
    const height = end.y - start.y;

    return {
      uuid: uuidv4(),
      shape: 'rectangle',
      color: 'rgba(200, 200, 200, 0.5)',
      border_color: '#666666',
      rotation: 0,
      position: start,
      text: {
        position: {
          x: start.x + width / 2,
          y: start.y + height / 2,
        },
        color: '#000000',
        text: 'New Area',
      },
      rectangle: {
        width,
        height,
      },
    };
  };

  const handleMouseDown = useCallback(
    (e: any) => {
      const stage = e.target.getStage();
      const pos = stage.getRelativePointerPosition();
      const { x, y } = pos;

      if (currentTool === EditorTool.ADD_ROW || currentTool === EditorTool.ADD_SHAPE) {
        setIsDrawing(true);
        setStartPoint({ x, y });
      } else if (currentTool === EditorTool.SELECT || currentTool === EditorTool.SELECT_ROW) {
        const clickedOn = e.target;
        const clickedEmpty = clickedOn === stage;

        if (clickedEmpty) {
          setSelectedIds([]);
          return;
        }

        const id = clickedOn.attrs.id;
        if (!id) return;

        if (currentTool === EditorTool.SELECT_ROW) {
          const rowWithSeat = seatingPlan.zones[0].rows.find((row) =>
            row.seats.some((seat) => seat.uuid === id),
          );
          if (rowWithSeat) {
            setSelectedIds(rowWithSeat.seats.map((seat) => seat.uuid));
          }
        } else {
          setSelectedIds([id]);
        }
      }
    },
    [currentTool, seatingPlan.zones],
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      if (!isDrawing || !startPoint) return;

      const stage = e.target.getStage();
      const pos = stage.getRelativePointerPosition();
      const { x, y } = pos;

      if (currentTool === EditorTool.ADD_ROW) {
        const dx = x - startPoint.x;
        const dy = y - startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        setPreviewShape({
          type: 'circle',
          x: startPoint.x,
          y: startPoint.y,
          radius,
        });
      } else if (currentTool === EditorTool.ADD_SHAPE) {
        setPreviewShape({
          type: 'rect',
          x: startPoint.x,
          y: startPoint.y,
          width: x - startPoint.x,
          height: y - startPoint.y,
        });
      }
    },
    [isDrawing, startPoint, currentTool],
  );

  const handleMouseUp = useCallback(
    (e: any) => {
      if (!isDrawing || !startPoint) return;

      const stage = e.target.getStage();
      const pos = stage.getRelativePointerPosition();
      const { x, y } = pos;

      if (currentTool === EditorTool.ADD_ROW) {
        const dx = x - startPoint.x;
        const dy = y - startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        if (radius > 20) { // Minimum radius check
          const newRow = createCircularRow(startPoint, radius, 12);
          const updatedZones = seatingPlan.zones.map((zone) =>
            zone.uuid === seatingPlan.zones[0].uuid
              ? { ...zone, rows: [...zone.rows, newRow] }
              : zone,
          );

          onChange({
            ...seatingPlan,
            zones: updatedZones,
          });
        }
      } else if (currentTool === EditorTool.ADD_SHAPE) {
        const newArea = createArea(startPoint, { x, y });
        const updatedZones = seatingPlan.zones.map((zone) =>
          zone.uuid === seatingPlan.zones[0].uuid
            ? { ...zone, areas: [...zone.areas, newArea] }
            : zone,
        );

        onChange({
          ...seatingPlan,
          zones: updatedZones,
        });
      }

      setIsDrawing(false);
      setStartPoint(null);
      setPreviewShape(null);
    },
    [isDrawing, startPoint, currentTool, seatingPlan, onChange],
  );

  // Calculate stage scale to fit the seating plan
  const scale = Math.min(
    stageSize.width / seatingPlan.size.width,
    stageSize.height / seatingPlan.size.height,
  ) * 0.9;

  return (
    <div ref={containerRef} className="canvas-container">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale * zoom}
        scaleY={scale * zoom}
        x={stageSize.width / 2}
        y={stageSize.height / 2}
        offsetX={seatingPlan.size.width / 2}
        offsetY={seatingPlan.size.height / 2}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer ref={layerRef}>
          {/* Background */}
          <Rect
            width={seatingPlan.size.width}
            height={seatingPlan.size.height}
            fill="#ffffff"
            stroke="#dddddd"
          />

          {/* Background image if exists */}
          {seatingPlan.backgroundImage && (
            <Rect
              width={seatingPlan.size.width}
              height={seatingPlan.size.height}
              fillPatternImage={new window.Image()}
              fillPatternScaleX={1}
              fillPatternScaleY={1}
            />
          )}

          {/* Areas */}
          {seatingPlan.zones.map((zone) =>
            zone.areas.map((area) => (
              <Group key={area.uuid}>
                {area.shape === 'rectangle' && area.rectangle && (
                  <Rect
                    id={area.uuid}
                    x={area.position.x}
                    y={area.position.y}
                    width={area.rectangle.width}
                    height={area.rectangle.height}
                    fill={area.color}
                    stroke={area.border_color}
                    draggable={currentTool === EditorTool.SELECT}
                  />
                )}
                <Text
                  x={area.text.position.x}
                  y={area.text.position.y}
                  text={area.text.text}
                  fill={area.text.color}
                  fontSize={14}
                  align="center"
                  verticalAlign="middle"
                />
              </Group>
            )),
          )}

          {/* Rows and Seats */}
          {seatingPlan.zones.map((zone) =>
            zone.rows.map((row) => (
              <Group key={row.uuid}>
                <Text
                  text={row.row_number}
                  x={row.position.x - 20}
                  y={row.position.y}
                  fontSize={12}
                />
                {row.seats.map((seat) => (
                  <Circle
                    key={seat.uuid}
                    id={seat.uuid}
                    x={seat.position.x}
                    y={seat.position.y}
                    radius={seat.radius || 11}
                    fill={
                      seat.category
                        ? seatingPlan.categories.find(
                            (c) => c.name === seat.category,
                          )?.color || '#ffffff'
                        : '#ffffff'
                    }
                    stroke="#000000"
                    strokeWidth={1}
                    draggable={currentTool === EditorTool.SELECT}
                  />
                ))}
              </Group>
            )),
          )}

          {/* Preview shapes */}
          {previewShape && (
            previewShape.type === 'circle' ? (
              <Circle
                x={previewShape.x}
                y={previewShape.y}
                radius={previewShape.radius}
                stroke="#666"
                strokeWidth={1}
                dash={[5, 5]}
              />
            ) : (
              <Rect
                x={previewShape.x}
                y={previewShape.y}
                width={previewShape.width}
                height={previewShape.height}
                stroke="#666"
                strokeWidth={1}
                dash={[5, 5]}
              />
            )
          )}

          {/* Selection transformer */}
          {selectedIds.length > 0 && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => newBox}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
