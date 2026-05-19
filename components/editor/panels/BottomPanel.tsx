'use client';

import { useState } from 'react';
import { Play, Pause, Clock, Copy, Trash2, Plus } from 'lucide-react';
import useEditorStore from '@/stores/editor-store';

export default function BottomPanel() {
  const { project, currentPageId, setCurrentPage, addPage, deletePage, duplicatePage, updatePage } = useEditorStore();
  const [draggedPage, setDraggedPage] = useState<string | null>(null);

  const handleDragStart = (pageId: string) => {
    setDraggedPage(pageId);
  };

  const handleDragOver = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    if (!draggedPage || draggedPage === targetPageId) return;
    // Drag reorder logic handled in store
  };

  return (
    <div className="h-32 bg-editor-panel border-t border-editor-border flex flex-col shrink-0">
      <div className="h-8 flex items-center px-4 border-b border-editor-border gap-4">
        <span className="text-xs text-scrapbook-500">Timeline</span>
        <div className="flex items-center gap-2 text-xs text-scrapbook-400">
          <Clock className="w-3 h-3" />
          <span>Total: {project?.pages.reduce((acc, p) => acc + p.duration, 0) || 0}s</span>
        </div>
      </div>
      <div className="flex-1 flex items-center px-4 gap-3 overflow-x-auto scrollbar-thin">
        {project?.pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={() => handleDragStart(page.id)}
            onDragOver={(e) => handleDragOver(e, page.id)}
            onClick={() => setCurrentPage(page.id)}
            className={`shrink-0 w-24 h-20 rounded-lg cursor-pointer transition-smooth relative group ${
              currentPageId === page.id
                ? 'ring-2 ring-scrapbook-500'
                : 'hover:ring-1 hover:ring-scrapbook-600'
            }`}
            style={{ backgroundColor: page.backgroundColor }}
          >
            <div className="absolute top-1 left-1 text-xs text-scrapbook-600 font-medium bg-white/80 px-1 rounded">
              {index + 1}
            </div>
            <div className="absolute bottom-1 right-1 text-xs text-scrapbook-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {page.duration}s
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth bg-black/20 rounded-lg">
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}
                  className="p-1 bg-white rounded text-scrapbook-700 hover:bg-scrapbook-100"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {project.pages.length > 2 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                    className="p-1 bg-white rounded text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => addPage()}
          className="shrink-0 w-24 h-20 border-2 border-dashed border-editor-border rounded-lg flex items-center justify-center text-scrapbook-500 hover:text-white hover:border-scrapbook-500 transition-smooth"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
