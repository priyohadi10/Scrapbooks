'use client';

import { useEffect, useCallback } from 'react';
import useEditorStore from '@/stores/editor-store';
import useUIStore from '@/stores/ui-store';

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    saveProject,
    copy,
    paste,
    cut,
    deleteElement,
    selectedElementIds,
    deselectAll,
    setZoom,
    zoom,
  } = useEditorStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProject();
        useUIStore.getState().showToast('Project saved', 'success');
        return;
      }

      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if ((ctrlKey && e.key === 'y') || (ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
        return;
      }

      if (ctrlKey && e.key === 'c') {
        e.preventDefault();
        copy();
        return;
      }

      if (ctrlKey && e.key === 'v') {
        e.preventDefault();
        paste();
        return;
      }

      if (ctrlKey && e.key === 'x') {
        e.preventDefault();
        cut();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          selectedElementIds.forEach((id) => deleteElement(id));
        }
        return;
      }

      if (e.key === 'Escape') {
        deselectAll();
        return;
      }

      if (ctrlKey && e.key === '=') {
        e.preventDefault();
        setZoom(zoom + 0.1);
        return;
      }
      if (ctrlKey && e.key === '-') {
        e.preventDefault();
        setZoom(zoom - 0.1);
        return;
      }
      if (ctrlKey && e.key === '0') {
        e.preventDefault();
        setZoom(1);
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedElementIds.length > 0) {
          e.preventDefault();
          const { project, currentPageId, updateElement } = useEditorStore.getState();
          const currentPage = project?.pages.find((p) => p.id === currentPageId);
          if (!currentPage) return;

          const delta = e.shiftKey ? 10 : 1;
          selectedElementIds.forEach((id) => {
            const element = currentPage.elements.find((el) => el.id === id);
            if (!element) return;

            let newX = element.x;
            let newY = element.y;

            switch (e.key) {
              case 'ArrowUp': newY -= delta; break;
              case 'ArrowDown': newY += delta; break;
              case 'ArrowLeft': newX -= delta; break;
              case 'ArrowRight': newX += delta; break;
            }

            updateElement(id, { x: newX, y: newY });
          });
        }
        return;
      }
    },
    [undo, redo, saveProject, copy, paste, cut, deleteElement, selectedElementIds, deselectAll, setZoom, zoom]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
