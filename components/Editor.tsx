import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap, undo, redo, historyField } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onHistoryChange: (historyState: { canUndo: boolean, canRedo: boolean }) => void;
}

export interface EditorRef {
  undo: () => void;
  redo: () => void;
}

const baseTheme = EditorView.theme({
  '&': {
    color: '#edf2f7',
    backgroundColor: 'transparent',
    height: '100%',
    padding: '1rem',
    fontSize: '14px',
    fontFamily: 'monospace',
  },
  '.cm-content': {
    caretColor: '#38b2ac',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: '#718096',
    border: 'none',
  },
  '.cm-scroller': {
    overflow: 'auto',
  }
});

export const Editor = forwardRef<EditorRef, EditorProps>(({ value, onChange, onHistoryChange }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useImperativeHandle(ref, () => ({
    undo: () => {
      if (viewRef.current) {
        undo({ state: viewRef.current.state, dispatch: viewRef.current.dispatch });
      }
    },
    redo: () => {
      if (viewRef.current) {
        redo({ state: viewRef.current.state, dispatch: viewRef.current.dispatch });
      }
    },
  }));

  const checkHistory = (state: EditorState) => {
    // The `false` parameter prevents an error if the field isn't available yet.
    // FIX: Cast historyState to a known shape to access 'done' and 'undone' properties.
    // The type of `state.field(historyField, false)` is `unknown`, so we need to
    // assert its type to safely access its properties for checking undo/redo state.
    const historyState = state.field(historyField, false) as { done: readonly unknown[], undone: readonly unknown[] } | undefined;
    if (historyState) {
      const canUndo = historyState.done.length > 0;
      const canRedo = historyState.undone.length > 0;
      onHistoryChange({ canUndo, canRedo });
    } else {
      // Fallback if history is not available
      onHistoryChange({ canUndo: false, canRedo: false });
    }
  };

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const startState = EditorState.create({
        doc: value,
        extensions: [
          markdown(),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          baseTheme,
          oneDark,
          EditorView.lineWrapping,
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
            }

            // This is the robust way to check for history changes.
            // It compares the history state object before and after the transaction.
            const oldHistoryState = update.startState.field(historyField, false);
            const newHistoryState = update.state.field(historyField, false);

            if (newHistoryState !== oldHistoryState) {
              checkHistory(update.state);
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      viewRef.current = view;
      checkHistory(view.state); // Set initial history state
    }
  }, [onChange, onHistoryChange]);

  useEffect(() => {
    // Sync external value changes to the editor
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      viewRef.current?.destroy();
    };
  }, []);

  return <div ref={editorRef} className="h-full w-full" />;
});