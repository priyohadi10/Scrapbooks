'use client';

import { 
  Undo2, Redo2, Save, Eye, Download, RotateCcw,
  ZoomIn, ZoomOut, Grid3X3, Magnet, ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useEditorStore from '@/stores/editor-store';
import useUIStore from '@/stores/ui-store';

export default function TopToolbar() {
  const router = useRouter();
  const {
    project,
    zoom,
    showGrid,
    snapToGrid,
    isSaving,
    lastSaved,
    undo,
    redo,
    saveProject,
    setZoom,
    toggleGrid,
    toggleSnapToGrid,
    historyIndex,
    history,
  } = useEditorStore();

  const { setShowPreview, setShowExport } = useUIStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSave = async () => {
    try {
      await saveProject();
      useUIStore.getState().showToast('Project saved successfully', 'success');
    } catch {
      useUIStore.getState().showToast('Failed to save project', 'error');
    }
  };

  return (
    <div className="h-14 bg-editor-panel border-b border-editor-border flex items-center px-4 gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-editor-border rounded-lg transition-smooth text-scrapbook-400 hover:text-white"
          title="Back to Dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-editor-border mx-1" />
        <span className="text-sm font-medium text-white truncate max-w-[200px]">
          {project?.settings.name || 'Untitled'}
        </span>
        {isSaving && (
          <span className="text-xs text-scrapbook-400 animate-pulse">Saving...</span>
        )}
        {lastSaved && !isSaving && (
          <span className="text-xs text-scrapbook-500">
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center gap-1">
        <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-editor-border rounded-lg transition-smooth disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
          <Undo2 className="w-5 h-5" />
        </button>
        <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-editor-border rounded-lg transition-smooth disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Y)">
          <Redo2 className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-editor-border mx-2" />
        <button onClick={handleSave} disabled={isSaving} className="p-2 hover:bg-editor-border rounded-lg transition-smooth disabled:opacity-50" title="Save (Ctrl+S)">
          <Save className="w-5 h-5" />
        </button>
        <button onClick={() => setShowPreview(true)} className="p-2 hover:bg-editor-border rounded-lg transition-smooth" title="Preview">
          <Eye className="w-5 h-5" />
        </button>
        <button onClick={() => setShowExport(true)} className="p-2 hover:bg-editor-border rounded-lg transition-smooth" title="Export">
          <Download className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-editor-border mx-2" />
        <button className="p-2 hover:bg-editor-border rounded-lg transition-smooth" title="Reset">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => setZoom(zoom - 0.1)} className="p-2 hover:bg-editor-border rounded-lg transition-smooth" title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm text-scrapbook-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom + 0.1)} className="p-2 hover:bg-editor-border rounded-lg transition-smooth" title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-editor-border mx-2" />
        <button onClick={toggleGrid} className={`p-2 rounded-lg transition-smooth ${showGrid ? 'bg-scrapbook-700 text-white' : 'hover:bg-editor-border text-scrapbook-400'}`} title="Toggle Grid">
          <Grid3X3 className="w-5 h-5" />
        </button>
        <button onClick={toggleSnapToGrid} className={`p-2 rounded-lg transition-smooth ${snapToGrid ? 'bg-scrapbook-700 text-white' : 'hover:bg-editor-border text-scrapbook-400'}`} title="Snap to Grid">
          <Magnet className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
