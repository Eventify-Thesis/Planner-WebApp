import React, { useState, useCallback } from 'react';
import { Grid, Stack } from '@mantine/core';
import { Layout } from 'antd';
import { SeatingPlan, Selection, EditorTool, Shape, Row } from './types/index';
import PlanSettingsPanel from './components/PlanSettingsPanel';
import SeatSettingsPanel from './components/SeatSettingsPanel';
import RowSettingsPanel from './components/RowSettingsPanel';
import ShapeSettingsPanel from './components/ShapeSettingsPanel';
import Canvas from './components/Canvas';
import SeatMapHeader from './components/SeatMapHeader/';
import useEditorState from './hooks/useEditorState';
import './EventSeatMap.css';

const { Content, Sider } = Layout;

const DEFAULT_SEATING_PLAN: SeatingPlan = {
  id: 'default',
  name: 'New Seating Plan',
  size: {
    width: 800,
    height: 600,
  },
  categories: [
    { name: 'Category I', color: '#F44336' },
    { name: 'Category II', color: '#9C27B0' },
    { name: 'Category III', color: '#4CAF50' },
    { name: 'Category IV', color: '#2196F3' },
    { name: 'Category V', color: '#8BC34A' },
  ],
  zones: [
    {
      uuid: 'default-zone',
      name: 'Ground Floor',
      zone_id: 'ground-floor',
      position: { x: 0, y: 0 },
      rows: [],
      areas: [],
    },
  ],
};

const EventSeatMap: React.FC = () => {
  const [seatingPlan, setSeatingPlan] =
    useState<SeatingPlan>(DEFAULT_SEATING_PLAN);
  const [showGrid, setShowGrid] = useState(true);
  const {
    currentTool,
    setCurrentTool,
    zoom,
    setZoom,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorState();
  const [selection, setSelection] = useState<Selection>({
    selectedItems: { seats: [], rows: [], areas: [] },
  });

  const handleSave = useCallback(() => {
    console.log('Saving seating plan:', seatingPlan);
    const dataStr = JSON.stringify(seatingPlan, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'seating-plan.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [seatingPlan]);

  const handlePlanChange = useCallback(
    (updatedPlan: SeatingPlan) => {
      setSeatingPlan(updatedPlan);
      addToHistory(updatedPlan);
    },
    [addToHistory],
  );

  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setSeatingPlan(previousState);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setSeatingPlan(nextState);
    }
  }, [redo]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  }, [setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, [setZoom]);

  const handleToolChange = useCallback(
    (tool: EditorTool) => {
      setCurrentTool(tool);
    },
    [setCurrentTool],
  );

  const handleSeatUpdate = (updatedSeat: any) => {
    const updatedPlan = { ...seatingPlan };
    const rowIndex = updatedPlan.zones[0].rows.findIndex((row) =>
      row.seats.some((seat) => seat.uuid === updatedSeat.uuid),
    );
    if (rowIndex !== -1) {
      const seatIndex = updatedPlan.zones[0].rows[rowIndex].seats.findIndex(
        (seat) => seat.uuid === updatedSeat.uuid,
      );
      if (seatIndex !== -1) {
        updatedPlan.zones[0].rows[rowIndex].seats[seatIndex] = updatedSeat;
        handlePlanChange(updatedPlan);
      }
    }
  };

  const handleRowsUpdate = (updatedRows: Row[]) => {
    const updatedPlan = { ...seatingPlan };
    updatedRows.forEach((updatedRow) => {
      const rowIndex = updatedPlan.zones[0].rows.findIndex(
        (row) => row.uuid === updatedRow.uuid,
      );
      if (rowIndex !== -1) {
        updatedPlan.zones[0].rows[rowIndex] = updatedRow;
      }
    });
    handlePlanChange(updatedPlan);
  };

  const handleShapesUpdate = (updatedShapes: Shape[]) => {
    const updatedPlan = { ...seatingPlan };
    updatedShapes.forEach((updatedShape) => {
      const shapeIndex = updatedPlan.zones[0].areas.findIndex(
        (shape) => shape.uuid === updatedShape.uuid,
      );
      if (shapeIndex !== -1) {
        updatedPlan.zones[0].areas[shapeIndex] = updatedShape;
      }
    });
    handlePlanChange(updatedPlan);
  };

  const selectedSeat = selection.selectedItems.seats[0]
    ? seatingPlan.zones[0].rows
        .find((row) =>
          row.seats.some(
            (seat) => seat.uuid === selection.selectedItems.seats[0],
          ),
        )
        ?.seats.find((seat) => seat.uuid === selection.selectedItems.seats[0])
    : undefined;

  const selectedRows = selection.selectedItems.rows
    .map((uuid) => seatingPlan.zones[0].rows.find((row) => row.uuid === uuid))
    .filter((row): row is Row => row !== undefined);

  const selectedShapes = selection.selectedItems.areas
    .map((uuid) =>
      seatingPlan.zones[0].areas.find((shape) => shape.uuid === uuid),
    )
    .filter((shape): shape is Shape => shape !== undefined);

  return (
    <Layout className="seat-map-layout">
      <SeatMapHeader
        currentTool={currentTool}
        zoom={zoom}
        showGrid={showGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        onToolChange={handleToolChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomChange={setZoom}
        onShowGridChange={setShowGrid}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <Layout>
        <Content className="seat-map-content">
          <Canvas
            seatingPlan={seatingPlan}
            currentTool={currentTool}
            zoom={zoom}
            showGrid={showGrid}
            onPlanChange={handlePlanChange}
            selection={selection}
            onSelectionChange={setSelection}
            setCurrentTool={setCurrentTool}
          />
        </Content>
        <Sider width={300} className="plan-settings-panel">
          <Stack spacing="md">
            {selectedSeat ? (
              <SeatSettingsPanel
                seat={selectedSeat}
                categories={seatingPlan.categories}
                onUpdate={handleSeatUpdate}
              />
            ) : selectedShapes.length > 0 || selectedRows.length > 0 ? (
              <>
                {selectedShapes.length > 0 && (
                  <ShapeSettingsPanel
                    shapes={selectedShapes}
                    onUpdate={handleShapesUpdate}
                  />
                )}
                {selectedRows.length > 0 && (
                  <RowSettingsPanel
                    rows={selectedRows}
                    categories={seatingPlan.categories}
                    onUpdate={handleRowsUpdate}
                  />
                )}
              </>
            ) : (
              <PlanSettingsPanel
                seatingPlan={seatingPlan}
                onUpdate={handlePlanChange}
              />
            )}
          </Stack>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default EventSeatMap;
