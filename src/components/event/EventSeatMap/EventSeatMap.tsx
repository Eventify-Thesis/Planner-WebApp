import React, { useState, useCallback, useEffect } from 'react';
import { Grid, Stack } from '@mantine/core';
import { Layout, Modal, Form, Input, message, Button } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';
import {
  useGetSeatingPlanDetail,
  useSeatingPlanMutations,
} from '@/queries/useSeatingPlanQueries';
import {
  SeatingPlan,
  Selection,
  EditorTool,
  Shape,
  Row,
  Seat,
  Area,
} from './types/index';
import PlanSettingsPanel from './components/PlanSettingsPanel';
import SeatSettingsPanel from './components/SeatSettingsPanel';
import RowSettingsPanel from './components/RowSettingsPanel';
import ShapeSettingsPanel from './components/ShapeSettingsPanel';
import Canvas from './components/Canvas';
import SeatMapHeader from './components/SeatMapHeader/';
import useEditorState from './hooks/useEditorState';
import './EventSeatMap.css';
import { useCanvasState } from './hooks/useCanvasState';
import { useCanvasHandlers } from './hooks/useCanvasHandlers';

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
  const { eventId, planId } = useParams();
  const [seatingPlan, setSeatingPlan] =
    useState<SeatingPlan>(DEFAULT_SEATING_PLAN);
  const [showGrid, setShowGrid] = useState(true);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const { data: existingPlan, isLoading: isLoadingPlan } =
    useGetSeatingPlanDetail(eventId!, planId!);
  const { createMutation, updateMutation } = useSeatingPlanMutations(
    eventId!,
    planId,
  );

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

  const { state, setters, actions, handlePlanChangeCanvas } = useCanvasState(
    selection,
    setSelection,
    setSeatingPlan,
  );

  const { handleCopy, handlePaste } = useCanvasHandlers(
    zoom,
    seatingPlan,
    currentTool,
    handlePlanChangeCanvas,
    setSelection,
    state,
    setters,
    actions,
  );

  const handleSaveToComputer = useCallback(() => {
    const dataStr = JSON.stringify(seatingPlan, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${seatingPlan.name
      .toLowerCase()
      .replace(/\s+/g, '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [seatingPlan]);

  const handleSave = useCallback(async () => {
    if (planId && planId !== 'new') {
      // Update existing plan
      try {
        setLoading(true);
        await updateMutation.mutateAsync({
          id: planId,
          name: seatingPlan.name,
          plan: JSON.stringify(seatingPlan),
        });
        message.success('Seating plan updated successfully');
      } catch (error) {
        console.error(error);
        message.error('Failed to update seating plan');
      } finally {
        setLoading(false);
      }
    } else {
      // Show modal for new plan
      setSaveModalVisible(true);
    }
  }, [planId, seatingPlan, updateMutation]);

  const handleModalSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const newPlan = {
        plan: JSON.stringify(seatingPlan),
        name: values.name,
        description: values.description,
      };

      await createMutation.mutateAsync(newPlan);
      message.success('Seating plan created successfully');
      setSaveModalVisible(false);
    } catch (error) {
      if (error.errorFields) {
        return; // Form validation error
      }
      message.error('Failed to create seating plan');
    } finally {
      setLoading(false);
    }
  };

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

  const findSeatById = (id: string): Seat | null => {
    for (const zone of seatingPlan.zones) {
      for (const row of zone.rows) {
        const seat = row.seats.find((seat) => seat.uuid === id);
        if (seat) return seat;
      }
    }
    return null;
  };

  const findRowById = (id: string): Row | null => {
    for (const zone of seatingPlan.zones) {
      const row = zone.rows.find((row) => row.uuid === id);
      if (row) return row;
    }
    return null;
  };

  const findAreaById = (id: string): Area | null => {
    for (const zone of seatingPlan.zones) {
      const area = zone.areas.find((area) => area.uuid === id);
      if (area) return area;
    }
    return null;
  };

  const onCopy = () => {
    const { seats, rows, areas } = selection.selectedItems;

    if (!seats.length && !rows.length && !areas.length) return;

    const copiedItems = {
      seats: seats.length
        ? seatingPlan.zones[0].rows.flatMap((row) =>
            row.seats.filter((seat) => seats.includes(seat.uuid)),
          )
        : [],
      rows: rows.length
        ? seatingPlan.zones[0].rows.filter((row) => rows.includes(row.uuid))
        : [],
      areas: areas.length
        ? seatingPlan.zones[0].areas.filter((area) => areas.includes(area.uuid))
        : [],
    };

    if (
      copiedItems.seats.length ||
      copiedItems.rows.length ||
      copiedItems.areas.length
    ) {
      setters.setClipboard(copiedItems);
    }
  };

  const handleCut = () => {
    handleCopy(null, true);

    const updatedPlan = { ...seatingPlan };
    const { seats, rows, areas } = selection.selectedItems;

    // Remove selected seats from all rows
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

    // Remove selected areas
    if (areas.length > 0) {
      updatedPlan.zones[0].areas = updatedPlan.zones[0].areas.filter(
        (area) => !areas.includes(area.uuid),
      );
    }

    // Update the plan and clear selection
    handlePlanChangeCanvas(updatedPlan);
    setSelection({ selectedItems: { seats: [], rows: [], areas: [] } });
  };

  const onPaste = () => {
    handlePaste(null, true);
  };

  const handleNewPlan = () => {
    Modal.confirm({
      title: 'Create New Plan',
      content:
        'Are you sure you want to create a new plan? All unsaved changes will be lost.',
      onOk: () => {
        const newPlan: SeatingPlan = DEFAULT_SEATING_PLAN;
        setSeatingPlan(newPlan);
        setSelection({ selectedItems: { seats: [], rows: [], areas: [] } });
        setters.setClipboard(null);
      },
    });
  };

  const handleLoadPlan = () => {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.style.display = 'none';

    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const plan = JSON.parse(event.target?.result as string);

          // Validate the plan structure
          if (
            !plan.id ||
            !plan.name ||
            !plan.size ||
            !Array.isArray(plan.zones)
          ) {
            Modal.error({
              title: 'Invalid Plan Format',
              content: 'The selected file is not a valid seating plan.',
            });
            return;
          }

          setSeatingPlan(plan);
          addToHistory(plan);

          Modal.success({
            title: 'Plan Loaded',
            content: `Successfully loaded plan: ${plan.name}`,
          });
        } catch (error) {
          Modal.error({
            title: 'Error Loading Plan',
            content:
              'Failed to parse the seating plan file. Please ensure it is a valid JSON file.',
          });
        }
      };

      reader.onerror = () => {
        Modal.error({
          title: 'Error Loading Plan',
          content: 'Failed to read the file. Please try again.',
        });
      };

      reader.readAsText(file);
    };

    // Trigger file selection
    fileInput.click();
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

  const handleStartCircleAlignment = useCallback(
    (type: 'byRadius' | 'byCenter') => {
      if (selection.selectedItems.rows.length !== 1) return;

      // Find the selected row
      const row = seatingPlan.zones[0].rows.find(
        (r) => r.uuid === selection.selectedItems.rows[0],
      );
      if (!row || row.seats.length === 0) return;

      // Calculate row's bounding box
      let minX = Infinity,
        minY = Infinity;
      let maxX = -Infinity,
        maxY = -Infinity;

      row.seats.forEach((seat) => {
        minX = Math.min(minX, seat.position.x);
        minY = Math.min(minY, seat.position.y);
        maxX = Math.max(maxX, seat.position.x);
        maxY = Math.max(maxY, seat.position.y);
      });

      // Calculate center of the row's bounding box
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Calculate initial radius based on row dimensions and seat spacing
      const spacing = row.seatSpacing || 35;
      const arcLength = spacing * (row.seats.length - 1);
      const defaultRadius = arcLength / (Math.PI / 2); // 90-degree arc

      setters.setCirclePreview({
        type,
        center: { x: centerX, y: centerY },
        radius: defaultRadius,
        originalPosition: { x: centerX, y: centerY },
      });
    },
    [seatingPlan, selection.selectedItems.rows, setters],
  );

  // Load existing plan if available
  useEffect(() => {
    if (existingPlan && !isLoadingPlan && planId !== 'new') {
      const parsedPlan = JSON.parse(existingPlan.plan);
      setSeatingPlan(parsedPlan);
      addToHistory(parsedPlan);
    }
  }, [existingPlan, isLoadingPlan, planId, addToHistory]);

  return (
    <Layout style={{ height: '100vh' }}>
      <Modal
        title="Save Seating Plan"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSaveModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={loading}
            onClick={handleModalSave}
          >
            Save
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ name: seatingPlan.name }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Enter seating plan name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea placeholder="Enter seating plan description" />
          </Form.Item>
        </Form>
      </Modal>

      <SeatMapHeader
        currentTool={currentTool}
        zoom={zoom}
        showGrid={showGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        canCopy={
          selection.selectedItems.seats.length > 0 ||
          selection.selectedItems.rows.length > 0 ||
          selection.selectedItems.areas.length > 0
        }
        canPaste={
          state.clipboard?.areas.length > 0 ||
          state.clipboard?.rows.length > 0 ||
          state.clipboard?.seats.length > 0
        }
        canCut={
          selection.selectedItems.seats.length > 0 ||
          selection.selectedItems.rows.length > 0 ||
          selection.selectedItems.areas.length > 0
        }
        onToolChange={handleToolChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomChange={setZoom}
        onShowGridChange={setShowGrid}
        onSave={handleSave}
        onSaveToComputer={handleSaveToComputer}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCopy={onCopy}
        onPaste={handlePaste}
        onCut={handleCut}
        onNewPlan={handleNewPlan}
        onLoadPlan={handleLoadPlan}
        loading={loading || isLoadingPlan}
      />
      <Layout>
        <Content className="seat-map-content">
          <Canvas
            seatingPlan={seatingPlan}
            currentTool={currentTool}
            zoom={zoom}
            showGrid={showGrid}
            onPlanChange={handlePlanChangeCanvas}
            selection={selection}
            onSelectionChange={setSelection}
            setCurrentTool={setCurrentTool}
            state={state}
            setters={setters}
            actions={actions}
            handlePlanChangeCanvas={handlePlanChangeCanvas}
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
                    rows={seatingPlan.zones[0].rows.filter((row) =>
                      selection.selectedItems.rows.includes(row.uuid),
                    )}
                    categories={seatingPlan.categories}
                    onUpdate={handleRowsUpdate}
                    onStartCircleAlignment={handleStartCircleAlignment}
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
