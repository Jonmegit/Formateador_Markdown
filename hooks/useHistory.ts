import { useState, useCallback, useEffect } from 'react';

type HistoryState = {
  history: string[];
  currentIndex: number;
};

export const useHistory = (initialState: string, storageKey: string) => {
  const [state, setStateInternal] = useState<HistoryState>(() => {
    try {
      const storedItem = window.localStorage.getItem(storageKey);
      if (storedItem) {
        const parsed = JSON.parse(storedItem);
        // Basic validation
        if (Array.isArray(parsed.history) && typeof parsed.currentIndex === 'number') {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error reading history from localStorage", error);
    }
    return { history: [initialState], currentIndex: 0 };
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving history to localStorage", error);
    }
  }, [storageKey, state]);
  
  const { history, currentIndex } = state;
  const currentState = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const setState = useCallback((value: string) => {
    if (value === currentState) {
      return;
    }
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(value);
    
    setStateInternal({
      history: newHistory,
      currentIndex: newHistory.length - 1,
    });
  }, [history, currentIndex, currentState]);

  const undo = useCallback(() => {
    if (canUndo) {
      setStateInternal(s => ({ ...s, currentIndex: s.currentIndex - 1 }));
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setStateInternal(s => ({ ...s, currentIndex: s.currentIndex + 1 }));
    }
  }, [canRedo]);
  
  const clearHistory = useCallback(() => {
    const clearedState = { history: [initialState], currentIndex: 0 };
    setStateInternal(clearedState);
    window.localStorage.removeItem(storageKey);
  }, [initialState, storageKey]);

  return { state: currentState, setState, undo, redo, canUndo, canRedo, clearHistory };
};