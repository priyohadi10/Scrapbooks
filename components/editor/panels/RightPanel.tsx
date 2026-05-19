'use client';

import { 
  Sliders, Layers, Move, RotateCw, Sun, Box, 
  ArrowUp, ArrowDown
} from 'lucide-react';
import useEditorStore from '@/stores/editor-store';
import useUIStore from '@/stores/ui-store';
import { ScrapbookElement } from '@/types';

export default function RightPanel() {
  const rightPanel = useEditorStore((state) => state.rightPanel);
  const setRightPanel = useEditorStore((state) => state.setRightPanel);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <div className={`flex shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-0' : 'w-72'}`}>
      {!sidebarCollapsed && (
        <div className="w-72 bg-editor-panel border-l border-editor-border flex flex-col">
          <div className="h-10 flex items-center px-3 border-b border-editor-border gap-1">
            <button
              onClick={() => setRightPanel('properties')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-smooth ${
                rightPanel === 'properties' ? 'bg-scrapbook-700 text-white' : 'text-scrapbook-400 hover:text-white'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setRightPanel('layers')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-smooth ${
                rightPanel === 'layers' ? 'bg-scrapbook-700 text-white' : 'text-scrapbook-400 hover:text-white'
              }`}
            >
              Layers
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {rightPanel === 'properties' ? <PropertiesPanel /> : <LayersPanel />}
          </div>
        </div>
      )}
    </div>
  );
}

function PropertiesPanel() {
  const { project, currentPageId, selectedElementIds, updateElement, deleteElement, bringToFront, sendToBack } = useEditorStore();
  const currentPage = project?.pages.find((p) => p.id === currentPageId);
  const selectedElements = currentPage?.elements.filter((el) => selectedElementIds.includes(el.id)) || [];
  const element = selectedElements.length === 1 ? selectedElements[0] : null;

  if (!element) {
    return (
      <div className="text-center py-8">
        <Sliders className="w-8 h-8 mx-auto mb-2 text-scrapbook-600" />
        <p className="text-sm text-scrapbook-500">
          {selectedElements.length > 1 
            ? `${selectedElements.length} elements selected` 
            : 'Select an element to edit properties'}
        </p>
      </div>
    );
  }

  const handleChange = (field: keyof ScrapbookElement, value: unknown) => {
    updateElement(element.id, { [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-scrapbook-400">
          <Move className="w-4 h-4" />
          <span className="text-xs font-medium">Position</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-scrapbook-500 mb-1 block">X</label>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              className="w-full bg-editor-bg border border-editor-border rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-scrapbook-500"
            />
          </div>
          <div>
            <label className="text-xs text-scrapbook-500 mb-1 block">Y</label>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              className="w-full bg-editor-bg border border-editor-border rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-scrapbook-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-scrapbook-400">
          <Box className="w-4 h-4" />
          <span className="text-xs font-medium">Size</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-scrapbook-500 mb-1 block">Width</label>
            <input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => handleChange('width', Number(e.target.value))}
              className="w-full bg-editor-bg border border-editor-border rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-scrapbook-500"
            />
          </div>
          <div>
            <label className="text-xs text-scrapbook-500 mb-1 block">Height</label>
            <input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => handleChange('height', Number(e.target.value))}
              className="w-full bg-editor-bg border border-editor-border rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-scrapbook-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-scrapbook-400">
          <RotateCw className="w-4 h-4" />
          <span className="text-xs font-medium">Rotation</span>
        </div>
        <input
          type="range"
          min="-180"
          max="180"
          value={element.rotation}
          onChange={(e) => handleChange('rotation', Number(e.target.value))}
          className="w-full accent-scrapbook-500"
        />
        <div className="flex justify-between text-xs text-scrapbook-500">
          <span>-180°</span>
          <span>{Math.round(element.rotation)}°</span>
          <span>180°</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-scrapbook-400">
          <Sun className="w-4 h-4" />
          <span className="text-xs font-medium">Opacity</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(element.opacity * 100)}
          onChange={(e) => handleChange('opacity', Number(e.target.value) / 100)}
          className="w-full accent-scrapbook-500"
        />
        <div className="text-xs text-scrapbook-500 text-right">{Math.round(element.opacity * 100)}%</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-scrapbook-400">
          <Layers className="w-4 h-4" />
          <span className="text-xs font-medium">Layer</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => bringToFront(element.id)}
            className="flex-1 py-1.5 bg-editor-border hover:bg-scrapbook-700 rounded-md text-xs text-scrapbook-300 hover:text-white transition-smooth flex items-center justify-center gap-1"
          >
            <ArrowUp className="w-3 h-3" /> Front
          </button>
          <button
            onClick={() => sendToBack(element.id)}
            className="flex-1 py-1.5 bg-editor-border hover:bg-scrapbook-700 rounded-md text-xs text-scrapbook-300 hover:text-white transition-smooth flex items-center justify-center gap-1"
          >
            <ArrowDown className="w-3 h-3" /> Back
          </button>
        </div>
      </div>

      {element.type === 'text' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-scrapbook-400">Text Properties</p>
          <div>
            <label className="text-xs text-scrapbook-500 mb-1 block">Content</label>
            <textarea
              value={element.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              className="w-full bg-editor-bg border border-editor-border rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-scrapbook-500 resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs text-scrapbook-500 mb-1 block">Font Size</label>
            <input
              type="number"
              value={element.fontSize || 16}
              onChange={(e) => handleChange('fontSize', Number(e.target.value))}
              className="w-full bg-editor-bg border border-editor-border rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-scrapbook-500"
            />
          </div>
          <div>
            <label className="text-xs text-scrapbook-500 mb-1 block">Color</label>
            <input
              type="color"
              value={element.color || '#333333'}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full h-8 bg-editor-bg border border-editor-border rounded-md cursor-pointer"
            />
          </div>
        </div>
      )}

      {element.type === 'shape' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-scrapbook-400">Shape Properties</p>
          <div>
            <label className="text-xs text-scrapbook-500 mb-1 block">Background Color</label>
            <input
              type="color"
              value={element.backgroundColor || '#c9bda8'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full h-8 bg-editor-bg border border-editor-border rounded-md cursor-pointer"
            />
          </div>
        </div>
      )}

      <button
        onClick={() => deleteElement(element.id)}
        className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-smooth"
      >
        Delete Element
      </button>
    </div>
  );
}

function LayersPanel() {
  const { project, currentPageId, selectedElementIds, selectElement } = useEditorStore();
  const currentPage = project?.pages.find((p) => p.id === currentPageId);
  const elements = currentPage?.elements.slice().sort((a, b) => b.zIndex - a.zIndex) || [];

  return (
    <div className="space-y-1">
      {elements.length === 0 ? (
        <p className="text-sm text-scrapbook-500 text-center py-8">No elements on this page</p>
      ) : (
        elements.map((element) => (
          <div
            key={element.id}
            onClick={() => selectElement(element.id)}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-smooth ${
              selectedElementIds.includes(element.id)
                ? 'bg-scrapbook-700 text-white'
                : 'bg-editor-border text-scrapbook-300 hover:bg-scrapbook-800 hover:text-white'
            }`}
          >
            <span className="text-xs text-scrapbook-500 w-6">{element.zIndex}</span>
            <span className="text-sm capitalize">{element.type}</span>
            <span className="text-xs text-scrapbook-500 ml-auto">
              {Math.round(element.width)}×{Math.round(element.height)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
