import { useState, useCallback } from 'react';
import { EditorTool } from '../types';

const MAX_HISTORY_SIZE = 50;

export interface EditorState {
  currentTool: EditorTool;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
}

const useEditorState = () => {
  const [currentTool, setCurrentTool] = useState<EditorTool>(EditorTool.SELECT);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback((state: any) => {
    setHistory((prev) => {
      // Remove all states after current index
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add new state
      newHistory.push(state);
      // Keep only last MAX_HISTORY_SIZE states
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    currentTool,
    setCurrentTool,
    zoom,
    setZoom,
    history,
    historyIndex,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

export default useEditorState;
