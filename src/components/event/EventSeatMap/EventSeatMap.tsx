import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Modal as AntdModal } from 'antd';
import {
  Modal,
  Button,
  Title,
  Text,
  Group,
  Paper,
  Stack,
  rem,
} from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { Layout, Form, Input, message } from 'antd';
import { IconArmchair, IconSquare } from '@tabler/icons-react';
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
  Section,
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
import SectionSettingsPanel from './components/SectionSettingsPanel';
const { Content, Sider } = Layout;

// Create styles for mode selection modal
const useStyles = createStyles((theme) => ({
  modalRoot: {
    border: `1px solid ${theme.colors.gray[2]}`,
    borderRadius: theme.radius.md,
  },
  modalTitle: {
    fontWeight: 700,
    fontSize: rem(24),
    marginBottom: theme.spacing.md,
    color: theme.colors.dark[8],
  },
  modeOption: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.gray[3]}`,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.colors.blue[0],
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.sm,
    },
  },
  modeOptionSelected: {
    backgroundColor: theme.colors.blue[0],
    borderColor: theme.colors.blue[5],
    boxShadow: theme.shadows.sm,
  },
  modeIcon: {
    margin: '0 auto',
    display: 'block',
    color: theme.colors.blue[6],
    marginBottom: theme.spacing.md,
  },
  modeTitle: {
    fontWeight: 700,
    textAlign: 'center',
    fontSize: rem(18),
    marginBottom: theme.spacing.xs,
  },
  modeDescription: {
    textAlign: 'center',
    color: theme.colors.gray[6],
    lineHeight: 1.5,
  },
}));

const DEFAULT_SEATING_PLAN: SeatingPlan = {
  id: 'default',
  name: 'New Seating Plan',
  size: {
    width: 800,
    height: 600,
  },
  categories: [
    { name: 'General', color: '#C5172E' },
    { name: 'Premium', color: '#C5172E' },
  ],
  zones: [
    {
      uuid: uuidv4(),
      name: 'Main Hall',
      zone_id: 'main-hall',
      position: { x: 0, y: 0 },
      rows: [],
      areas: [],
      sections: [],
    },
  ],
  mode: undefined,
  totalSeats: 0,
};

const EventSeatMap: React.FC = () => {
  const { eventId, planId } = useParams();
  const [seatingPlan, setSeatingPlan] =
    useState<SeatingPlan>(DEFAULT_SEATING_PLAN);

  const [showGrid, setShowGrid] = useState(true);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [modeSelectionModalVisible, setModeSelectionModalVisible] =
    useState(false);
  const [selectedMode, setSelectedMode] = useState<'seat' | 'section'>('seat');
  const [modeChangeModalVisible, setModeChangeModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { classes, cx } = useStyles();

  const { data: existingPlan, isLoading: isLoadingPlan } =
    useGetSeatingPlanDetail(eventId!, planId!);

  const firstRender = useRef(true);
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
    selectedItems: { seats: [], rows: [], areas: [], sections: [] },
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

  const handleSectionsUpdate = (updatedSections: Section[]) => {
    const updatedPlan = { ...seatingPlan };
    updatedSections.forEach((updatedSection) => {
      const sectionIndex = updatedPlan.zones[0].sections.findIndex(
        (section) => section.uuid === updatedSection.uuid,
      );
      if (sectionIndex !== -1) {
        updatedPlan.zones[0].sections[sectionIndex] = updatedSection;
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

  const onCopy = () => {
    const { seats, rows, areas, sections } = selection.selectedItems;

    if (!seats.length && !rows.length && !areas.length && !sections.length)
      return;

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
      sections: sections.length
        ? seatingPlan.zones[0].sections.filter((section) =>
            sections.includes(section.uuid),
          )
        : [],
    };

    if (
      copiedItems.seats.length ||
      copiedItems.rows.length ||
      copiedItems.areas.length ||
      copiedItems.sections.length
    ) {
      setters.setClipboard(copiedItems);
    }
  };

  const handleCut = () => {
    handleCopy(null, true);

    const updatedPlan = { ...seatingPlan };
    const { seats, rows, areas, sections } = selection.selectedItems;

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

    // Remove selected sections
    if (sections.length > 0) {
      updatedPlan.zones[0].sections = updatedPlan.zones[0].sections.filter(
        (section) => !sections.includes(section.uuid),
      );
    }

    // Update the plan and clear selection
    handlePlanChangeCanvas(updatedPlan);
    setSelection({
      selectedItems: { seats: [], rows: [], areas: [], sections: [] },
    });
  };

  const onPaste = () => {
    handlePaste(null, true);
  };

  const handleNewPlan = () => {
    AntdModal.confirm({
      title: 'Create New Plan',
      content:
        'Are you sure you want to create a new plan? All unsaved changes will be lost.',
      onOk: () => {
        const newPlan: SeatingPlan = DEFAULT_SEATING_PLAN;
        setSeatingPlan(newPlan);
        setSelection({
          selectedItems: { seats: [], rows: [], areas: [], sections: [] },
        });
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
            AntdModal.error({
              title: 'Invalid Plan Format',
              content: 'The selected file is not a valid seating plan.',
            });
            return;
          }

          setSeatingPlan(plan);
          addToHistory(plan);

          AntdModal.success({
            title: 'Plan Loaded',
            content: `Successfully loaded plan: ${plan.name}`,
          });
        } catch (error) {
          AntdModal.error({
            title: 'Error Loading Plan',
            content:
              'Failed to parse the seating plan file. Please ensure it is a valid JSON file.',
          });
        }
      };

      reader.onerror = () => {
        AntdModal.error({
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

  const selectedSections =
    selection.selectedItems?.sections &&
    selection.selectedItems.sections.length > 0
      ? selection.selectedItems.sections
          .map((uuid) =>
            seatingPlan.zones[0].sections.find(
              (section) => section.uuid === uuid,
            ),
          )
          .filter((section): section is Section => section !== undefined)
      : [];

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
    if (
      existingPlan &&
      !isLoadingPlan &&
      planId !== 'new' &&
      firstRender.current
    ) {
      const parsedPlan = JSON.parse(existingPlan.plan);
      setSeatingPlan(parsedPlan);
      addToHistory(parsedPlan);
      firstRender.current = false;
    } else if (
      planId === 'new' &&
      seatingPlan?.mode == undefined &&
      firstRender.current
    ) {
      // For new plans, show the mode selection modal
      setModeSelectionModalVisible(true);
      firstRender.current = false;
    }
  }, [existingPlan, isLoadingPlan, planId, addToHistory]);

  // Show the mode selection modal when the component mounts if no mode is set
  useEffect(() => {
    // If no mode is selected or it's first load, show the modal
    if (!selectedMode && seatingPlan.mode === undefined && !isLoadingPlan) {
      setModeSelectionModalVisible(true);
    }
  }, [selectedMode, seatingPlan.mode, isLoadingPlan]);

  // Handler for mode selection from initial modal
  const handleModeSelect = useCallback(
    (mode: 'seat' | 'section') => {
      setSelectedMode(mode);

      // Update seating plan with the selected mode
      setSeatingPlan((prevPlan) => ({
        ...prevPlan,
        mode: mode,
      }));

      setModeSelectionModalVisible(false);
    },
    [
      seatingPlan,
      selectedMode,
      setSelectedMode,
      setSeatingPlan,
      setModeSelectionModalVisible,
    ],
  );

  // Handler for mode change from header - opens confirmation dialog
  const handleModeChangeRequest = (newMode: 'seat' | 'section') => {
    if (seatingPlan.mode === newMode) return; // No change needed

    // Open the confirmation modal
    setModeChangeModalVisible(true);
  };

  // Handler for confirming mode change
  const handleModeChangeConfirm = useCallback(() => {
    const newMode = selectedMode == 'seat' ? 'section' : 'seat';

    console.log('Confirm mode change to: ', newMode);
    setSeatingPlan({
      ...DEFAULT_SEATING_PLAN,
      mode: newMode,
    });

    // Update selected mode
    setSelectedMode(newMode);

    // Close the confirmation modal
    setModeChangeModalVisible(false);
  }, [selectedMode, seatingPlan, setSeatingPlan, setSelectedMode]);

  // Handler for cancelling mode change
  const handleModeChangeCancel = () => {
    // Close the confirmation modal
    setModeChangeModalVisible(false);
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Save Modal */}
      <Modal
        title="Save Seating Plan"
        opened={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        centered
      >
        <Stack gap="md">
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
              rules={[
                { required: true, message: 'Please enter a description' },
              ]}
            >
              <Input.TextArea placeholder="Enter seating plan description" />
            </Form.Item>
          </Form>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setSaveModalVisible(false)}>
              Cancel
            </Button>
            <Button loading={loading} onClick={handleModalSave}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Mode Selection Modal */}
      <Modal
        opened={modeSelectionModalVisible}
        onClose={() => setModeSelectionModalVisible(false)}
        title={<Title className={classes.modalTitle}>Choose Editor Mode</Title>}
        centered
        size="lg"
        radius="md"
        overlayProps={{ blur: 3 }}
        classNames={{ root: classes.modalRoot }}
      >
        <Group gap="lg" grow>
          <Paper
            className={cx(
              classes.modeOption,
              selectedMode === 'seat' && classes.modeOptionSelected,
            )}
            onClick={() => handleModeSelect('seat')}
            shadow="xs"
          >
            <IconArmchair size={48} className={classes.modeIcon} />
            <Title order={3} className={classes.modeTitle}>
              Seat Mode
            </Title>
            <Text className={classes.modeDescription}>
              Create and manage individual seats, rows, and areas for your
              seating plan.
            </Text>
          </Paper>

          <Paper
            className={cx(
              classes.modeOption,
              selectedMode === 'section' && classes.modeOptionSelected,
            )}
            onClick={() => handleModeSelect('section')}
            shadow="xs"
          >
            <IconSquare size={48} className={classes.modeIcon} />
            <Title order={3} className={classes.modeTitle}>
              Section Mode
            </Title>
            <Text className={classes.modeDescription}>
              Create and manage larger sections for your seating plan.
            </Text>
          </Paper>
        </Group>
      </Modal>

      {/* Mode Change Confirmation Modal */}
      <Modal
        opened={modeChangeModalVisible}
        onClose={handleModeChangeCancel}
        title={<Title order={3}>Change Editor Mode</Title>}
        centered
        size="md"
      >
        <Stack gap="md">
          <Text>
            Changing the editor mode will reset your current work area. Are you
            sure you want to continue?
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleModeChangeCancel}>
              Cancel
            </Button>
            <Button color="red" onClick={handleModeChangeConfirm}>
              Change Mode
            </Button>
          </Group>
        </Stack>
      </Modal>

      <SeatMapHeader
        currentTool={currentTool}
        zoom={zoom}
        showGrid={showGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        mode={seatingPlan.mode as 'seat' | 'section'}
        onModeChange={handleModeChangeRequest}
        canCopy={
          selection.selectedItems.seats.length > 0 ||
          selection.selectedItems.rows.length > 0 ||
          selection.selectedItems.areas.length > 0 ||
          selection.selectedItems?.sections?.length > 0
        }
        canPaste={
          !!state.clipboard &&
          (!!(state.clipboard.areas && state.clipboard.areas.length > 0) ||
            !!(state.clipboard.rows && state.clipboard.rows.length > 0) ||
            !!(state.clipboard.seats && state.clipboard.seats.length > 0) ||
            !!(
              state.clipboard.sections && state.clipboard?.sections?.length > 0
            ))
        }
        canCut={
          selection.selectedItems.seats.length > 0 ||
          selection.selectedItems.rows.length > 0 ||
          selection.selectedItems.areas.length > 0 ||
          selection.selectedItems?.sections?.length > 0
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
            mode={selectedMode}
          />
        </Content>
        <Sider width={300} className="plan-settings-panel">
          <Stack gap="md">
            {selectedSeat ? (
              <SeatSettingsPanel
                seat={selectedSeat}
                categories={seatingPlan.categories}
                onUpdate={handleSeatUpdate}
              />
            ) : selectedShapes.length > 0 ||
              selectedRows.length > 0 ||
              selectedSections.length > 0 ? (
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
                {selectedSections.length > 0 && (
                  <SectionSettingsPanel
                    sections={selectedSections}
                    onUpdate={handleSectionsUpdate}
                    categories={seatingPlan.categories}
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

      {/* Mode Selection Modal */}
      <Modal
        opened={modeSelectionModalVisible}
        onClose={() => setModeSelectionModalVisible(false)}
        title={<Title className={classes.modalTitle}>Choose Editor Mode</Title>}
        centered
        size="lg"
        radius="md"
        overlayProps={{ blur: 3 }}
        classNames={{ root: classes.modalRoot }}
      >
        <Group gap="lg" grow>
          <Paper
            className={cx(
              classes.modeOption,
              selectedMode === 'seat' && classes.modeOptionSelected,
            )}
            onClick={() => handleModeSelect('seat')}
            shadow="xs"
          >
            <IconArmchair size={48} className={classes.modeIcon} />
            <Title order={3} className={classes.modeTitle}>
              Seat Mode
            </Title>
            <Text className={classes.modeDescription}>
              Create and manage individual seats, rows, and areas for your
              seating plan.
            </Text>
          </Paper>

          <Paper
            className={cx(
              classes.modeOption,
              selectedMode === 'section' && classes.modeOptionSelected,
            )}
            onClick={() => handleModeSelect('section')}
            shadow="xs"
          >
            <IconSquare size={48} className={classes.modeIcon} />
            <Title order={3} className={classes.modeTitle}>
              Section Mode
            </Title>
            <Text className={classes.modeDescription}>
              Create and manage larger sections for your seating plan.
            </Text>
          </Paper>
        </Group>
      </Modal>
    </Layout>
  );
};

export default EventSeatMap;
