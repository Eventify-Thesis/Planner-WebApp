import { useState, useCallback } from 'react';
import {
  Point,
  Selection,
  PreviewShape,
  DragPreview,
  Clipboard,
  SeatingPlan,
  EditorTool,
} from '../types/index';

const MAX_HISTORY_SIZE = 50;

export const useCanvasState = (
  selection: Selection,
  setSelection: (selection: Selection) => void,
  onPlanChange: (plan: SeatingPlan) => void,
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewShape, setPreviewShape] = useState<PreviewShape | null>(null);
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    startPoint: Point;
    endPoint: Point;
  } | null>(null);
  const [clipboard, setClipboard] = useState<Clipboard | null>(null);
  const [stageSize, setStageSize] = useState({ width: 1, height: 1 });
  const [history, setHistory] = useState<SeatingPlan[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const resetDrawingState = useCallback(() => {
    setIsDrawing(false);
    setStartPoint(null);
    setPreviewShape(null);
  }, []);

  const resetDragState = useCallback(() => {
    setDraggedSeatId(null);
    setIsDragging(false);
    setDragPreview(null);
  }, []);

  const resetSelectionState = useCallback(() => {
    setSelection({
      selectedItems: {
        seats: [],
        rows: [],
        areas: [],
      },
    });
    setSelectionBox(null);
  }, []);

  const addToHistory = useCallback(
    (plan: SeatingPlan) => {
      if (JSON.stringify(plan) === JSON.stringify(history[historyIndex])) {
        return; // Don't add if nothing changed
      }

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(plan))); // Deep clone to prevent reference issues

      // Keep history size manageable
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex],
  );

  const handlePlanChange = useCallback(
    (plan: SeatingPlan) => {
      addToHistory(plan);
      onPlanChange(plan);
    },
    [addToHistory, onPlanChange],
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => {
        const newIndex = prev - 1;
        onPlanChange(history[newIndex]); 
        return newIndex;
      });
    }
  }, [historyIndex, history, onPlanChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => {
        const newIndex = prev + 1;
        onPlanChange(history[newIndex]); 
        return newIndex;
      });
    }
  }, [historyIndex, history, onPlanChange]);

  return {
    state: {
      isDrawing,
      startPoint,
      previewShape,
      draggedSeatId,
      selection,
      isDragging,
      dragPreview,
      selectionBox,
      clipboard,
      stageSize,
      history,
      historyIndex,
    },
    setters: {
      setIsDrawing,
      setStartPoint,
      setPreviewShape,
      setDraggedSeatId,
      setSelection,
      setIsDragging,
      setDragPreview,
      setSelectionBox,
      setClipboard,
      setStageSize,
      setHistory,
      setHistoryIndex,
    },
    actions: {
      resetDrawingState,
      resetDragState,
      resetSelectionState,
      addToHistory,
      undo,
      redo,
    },
    handlePlanChange,
  };
};
