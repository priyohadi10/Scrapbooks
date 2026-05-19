'use client';

import { useState } from 'react';
import { 
  LayoutGrid, Image, Type, Sparkles, Palette, BookOpen, 
  Wand2, Music, ChevronLeft, ChevronRight, Upload, Copy, Trash2
} from 'lucide-react';
import useEditorStore from '@/stores/editor-store';
import useUIStore from '@/stores/ui-store';

const panelItems = [
  { id: 'pages' as const, icon: LayoutGrid, label: 'Pages' },
  { id: 'photos' as const, icon: Image, label: 'Photos' },
  { id: 'text' as const, icon: Type, label: 'Text' },
  { id: 'ornament' as const, icon: Sparkles, label: 'Ornaments' },
  { id: 'background' as const, icon: Palette, label: 'Background' },
  { id: 'cover' as const, icon: BookOpen, label: 'Cover' },
  { id: 'animation' as const, icon: Wand2, label: 'Animation' },
  { id: 'audio' as const, icon: Music, label: 'Audio' },
];

export default function LeftPanel() {
  const panel = useEditorStore((state) => state.panel);
  const setPanel = useEditorStore((state) => state.setPanel);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <div className={`flex shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-14' : 'w-64'}`}>
      <div className="w-14 bg-editor-panel border-r border-editor-border flex flex-col items-center py-3 gap-1">
        {panelItems.map((item) => {
          const Icon = item.icon;
          const isActive = panel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setPanel(item.id);
                if (sidebarCollapsed) toggleSidebar();
              }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-smooth ${
                isActive 
                  ? 'bg-scrapbook-700 text-white' 
                  : 'text-scrapbook-400 hover:text-white hover:bg-editor-border'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {!sidebarCollapsed && (
        <div className="w-52 bg-editor-panel border-r border-editor-border flex flex-col">
          <div className="h-10 flex items-center justify-between px-3 border-b border-editor-border">
            <span className="text-sm font-medium text-white capitalize">{panel}</span>
            <button onClick={toggleSidebar} className="p-1 hover:bg-editor-border rounded transition-smooth">
              <ChevronLeft className="w-4 h-4 text-scrapbook-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <PanelContent panel={panel} />
          </div>
        </div>
      )}

      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="absolute left-14 top-1/2 -translate-y-1/2 z-10 w-5 h-8 bg-editor-panel border border-editor-border rounded-r-lg flex items-center justify-center hover:bg-editor-border transition-smooth"
        >
          <ChevronRight className="w-3 h-3 text-scrapbook-400" />
        </button>
      )}
    </div>
  );
}

function PanelContent({ panel }: { panel: string }) {
  const { project, currentPageId, addElement, updatePage } = useEditorStore();
  const currentPage = project?.pages.find((p) => p.id === currentPageId);

  const handleAddText = () => {
    if (!currentPage) return;
    const pageWidth = project?.settings.size.width || 1000;
    const pageHeight = project?.settings.size.height || 1000;
    addElement({
      type: 'text',
      x: pageWidth / 2 - 100,
      y: pageHeight / 2 - 20,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      text: 'Double click to edit',
      fontFamily: 'Inter',
      fontSize: 24,
      color: '#333333',
    });
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'triangle') => {
    if (!currentPage) return;
    const pageWidth = project?.settings.size.width || 1000;
    const pageHeight = project?.settings.size.height || 1000;
    addElement({
      type: 'shape',
      x: pageWidth / 2 - 50,
      y: pageHeight / 2 - 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      shapeType,
      backgroundColor: '#c9bda8',
    });
  };

  const handleBgChange = (color: string) => {
    if (!currentPageId) return;
    updatePage(currentPageId, { backgroundColor: color });
  };

  const colors = ['#ffffff', '#faf9f7', '#f0ede8', '#e0d9ce', '#c9bda8', '#b09d7e', '#9a8263', '#7d664d', '#665240', '#564538'];

  switch (panel) {
    case 'pages':
      return <PagesPanel />;
    case 'photos':
      return (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-editor-border rounded-lg p-4 text-center hover:border-scrapbook-500 transition-smooth cursor-pointer">
            <Upload className="w-6 h-6 mx-auto mb-2 text-scrapbook-400" />
            <p className="text-xs text-scrapbook-400">Drop images here</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="aspect-square bg-editor-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-scrapbook-700 transition-smooth">
                <Image className="w-6 h-6 text-scrapbook-500" />
              </div>
            ))}
          </div>
        </div>
      );
    case 'text':
      return (
        <div className="space-y-3">
          <button onClick={handleAddText} className="w-full py-2.5 bg-scrapbook-700 hover:bg-scrapbook-600 text-white rounded-lg text-sm font-medium transition-smooth">
            Add Text Box
          </button>
          <div className="space-y-2">
            <p className="text-xs text-scrapbook-500 font-medium">Quick Text</p>
            {['Heading', 'Subheading', 'Body Text', 'Caption'].map((text) => (
              <button
                key={text}
                onClick={() => {
                  const pageWidth = project?.settings.size.width || 1000;
                  const pageHeight = project?.settings.size.height || 1000;
                  const sizes: Record<string, number> = { Heading: 48, Subheading: 32, 'Body Text': 16, Caption: 12 };
                  addElement({
                    type: 'text',
                    x: pageWidth / 2 - 100,
                    y: pageHeight / 2 - sizes[text] / 2,
                    width: 200,
                    height: sizes[text] * 1.5,
                    rotation: 0,
                    opacity: 1,
                    text,
                    fontFamily: 'Inter',
                    fontSize: sizes[text],
                    color: '#333333',
                  });
                }}
                className="w-full py-2 px-3 bg-editor-border hover:bg-scrapbook-700 rounded-lg text-sm text-scrapbook-300 hover:text-white transition-smooth text-left"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      );
    case 'ornament':
      return (
        <div className="space-y-3">
          <p className="text-xs text-scrapbook-500 font-medium">Shapes</p>
          <div className="grid grid-cols-3 gap-2">
            {(['rectangle', 'circle', 'triangle'] as const).map((shape) => (
              <button
                key={shape}
                onClick={() => handleAddShape(shape)}
                className="aspect-square bg-editor-border hover:bg-scrapbook-700 rounded-lg flex items-center justify-center transition-smooth"
              >
                <div className={`w-6 h-6 ${shape === 'circle' ? 'rounded-full' : 'rounded-sm'} bg-scrapbook-400`} />
              </button>
            ))}
          </div>
          <p className="text-xs text-scrapbook-500 font-medium">Stickers</p>
          <div className="grid grid-cols-3 gap-2">
            {['star', 'heart', 'flower', 'leaf', 'ribbon', 'bow'].map((s) => (
              <div key={s} className="aspect-square bg-editor-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-scrapbook-700 transition-smooth">
                <Sparkles className="w-5 h-5 text-scrapbook-500" />
              </div>
            ))}
          </div>
        </div>
      );
    case 'background':
      return (
        <div className="space-y-3">
          <p className="text-xs text-scrapbook-500 font-medium">Colors</p>
          <div className="grid grid-cols-5 gap-1.5">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleBgChange(color)}
                className="w-full aspect-square rounded-md border border-editor-border hover:scale-110 transition-smooth"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-xs text-scrapbook-500 font-medium">Paper Types</p>
          {(['matte', 'glossy', 'textured', 'kraft', 'linen'] as const).map((paper) => (
            <button
              key={paper}
              onClick={() => currentPageId && updatePage(currentPageId, { paperType: paper })}
              className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-smooth ${
                currentPage?.paperType === paper ? 'bg-scrapbook-700 text-white' : 'bg-editor-border text-scrapbook-300 hover:bg-scrapbook-700 hover:text-white'
              }`}
            >
              {paper.charAt(0).toUpperCase() + paper.slice(1)}
            </button>
          ))}
        </div>
      );
    case 'cover':
      return (
        <div className="space-y-3">
          <p className="text-xs text-scrapbook-500 font-medium">Cover Material</p>
          {(['canvas', 'leather', 'glossy', 'linen', 'kraft', 'matte'] as const).map((material) => (
            <button
              key={material}
              className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-smooth ${
                project?.settings.cover.material === material ? 'bg-scrapbook-700 text-white' : 'bg-editor-border text-scrapbook-300 hover:bg-scrapbook-700 hover:text-white'
              }`}
            >
              {material.charAt(0).toUpperCase() + material.slice(1)}
            </button>
          ))}
        </div>
      );
    case 'animation':
      return (
        <div className="space-y-3">
          <p className="text-xs text-scrapbook-500 font-medium">Page Transitions</p>
          {(['none', 'fade', 'slide', 'curl', 'flip'] as const).map((transition) => (
            <button
              key={transition}
              onClick={() => currentPageId && updatePage(currentPageId, { transition })}
              className={`w-full py-2 px-3 rounded-lg text-sm text-left transition-smooth ${
                currentPage?.transition === transition ? 'bg-scrapbook-700 text-white' : 'bg-editor-border text-scrapbook-300 hover:bg-scrapbook-700 hover:text-white'
              }`}
            >
              {transition.charAt(0).toUpperCase() + transition.slice(1)}
            </button>
          ))}
        </div>
      );
    case 'audio':
      return (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-editor-border rounded-lg p-4 text-center hover:border-scrapbook-500 transition-smooth cursor-pointer">
            <Music className="w-6 h-6 mx-auto mb-2 text-scrapbook-400" />
            <p className="text-xs text-scrapbook-400">Add background music</p>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function PagesPanel() {
  const { project, currentPageId, setCurrentPage, addPage, deletePage, duplicatePage, reorderPages } = useEditorStore();
  const [draggedPage, setDraggedPage] = useState<string | null>(null);

  const handleDragStart = (pageId: string) => {
    setDraggedPage(pageId);
  };

  const handleDragOver = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault();
    if (!draggedPage || draggedPage === targetPageId) return;
    const pages = project?.pages || [];
    const draggedIndex = pages.findIndex((p) => p.id === draggedPage);
    const targetIndex = pages.findIndex((p) => p.id === targetPageId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newPages = [...pages];
    const [removed] = newPages.splice(draggedIndex, 1);
    newPages.splice(targetIndex, 0, removed);
    reorderPages(newPages.map((p) => p.id));
  };

  return (
    <div className="space-y-2">
      {project?.pages.map((page, index) => (
        <div
          key={page.id}
          draggable
          onDragStart={() => handleDragStart(page.id)}
          onDragOver={(e) => handleDragOver(e, page.id)}
          onClick={() => setCurrentPage(page.id)}
          className={`p-2 rounded-lg cursor-pointer transition-smooth ${
            currentPageId === page.id 
              ? 'bg-scrapbook-700 ring-1 ring-scrapbook-500' 
              : 'bg-editor-border hover:bg-scrapbook-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-scrapbook-500 w-6">{index + 1}</span>
            <div className="flex-1 h-12 bg-white/10 rounded border border-white/5" />
            <div className="flex flex-col gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}
                className="p-1 hover:bg-white/10 rounded text-scrapbook-400 hover:text-white"
              >
                <Copy className="w-3 h-3" />
              </button>
              {project.pages.length > 2 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                  className="p-1 hover:bg-red-500/20 rounded text-scrapbook-400 hover:text-red-400"
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
        className="w-full py-2.5 border-2 border-dashed border-editor-border rounded-lg text-scrapbook-400 hover:text-white hover:border-scrapbook-500 transition-smooth text-sm font-medium"
      >
        + Add Page
      </button>
    </div>
  );
}
