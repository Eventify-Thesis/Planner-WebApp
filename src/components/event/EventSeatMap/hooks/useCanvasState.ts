import { useState, useCallback } from 'react';
import { Point, Selection, PreviewShape, DragPreview, Clipboard } from '../types';

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
    },
    actions: {
      resetDrawingState,
      resetDragState,
      resetSelectionState,
    },
  };
};
