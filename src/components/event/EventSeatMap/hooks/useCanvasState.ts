import { useState, useCallback } from 'react';
import { Point, Selection, PreviewShape, DragPreview, Clipboard, SeatingPlan } from '../types';

export interface CanvasState {
  isDrawing: boolean;
  startPoint: Point | null;
  previewShape: PreviewShape | null;
  draggedSeatId: string | null;
  selection: Selection;
  isDragging: boolean;
  dragPreview: DragPreview | null;
  selectionBox: { startPoint: Point; endPoint: Point } | null;
  clipboard: Clipboard | null;
  stageSize: { width: number; height: number };
  history: SeatingPlan[];
  historyIndex: number;
}

export const useCanvasState = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewShape, setPreviewShape] = useState<PreviewShape | null>(null);
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>({ type: 'none', ids: [] });
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
    setSelection({ type: 'none', ids: [] });
    setSelectionBox(null);
  }, []);

  const addToHistory = useCallback((plan: SeatingPlan) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(plan)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return JSON.parse(JSON.stringify(history[historyIndex - 1]));
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      return JSON.parse(JSON.stringify(history[historyIndex + 1]));
    }
    return null;
  }, [history, historyIndex]);

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
  };
};
