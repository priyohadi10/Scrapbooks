import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  Project, Page, ScrapbookElement, EditorState, 
  HistoryState, ProjectSettings, BookType, CoverMaterial 
} from '@/types';
import { generateId, deepClone, getDefaultPageSize } from '@/lib/utils';
import { projectService } from '@/lib/supabase/project-service';
import { debounce } from '@/lib/utils';

const createDefaultPage = (index: number): Page => ({
  id: generateId(),
  index,
  duration: 5,
  paperType: 'matte',
  transition: 'fade',
  backgroundColor: '#ffffff',
  elements: [],
});

const createDefaultProject = (name: string = 'Untitled Project'): Project => ({
  id: generateId(),
  userId: 'anonymous',
  settings: {
    name,
    bookType: 'square',
    size: { width: 1000, height: 1000, unit: 'px' },
    cover: {
      material: 'canvas',
      title: name,
    },
    pageDuration: 5,
    defaultPaperType: 'matte',
    defaultTransition: 'fade',
  },
  pages: [createDefaultPage(0), createDefaultPage(1)],
  assets: [],
  exportConfig: {
    format: 'pdf',
    quality: 'high',
    fps: 30,
    includeAudio: false,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const MAX_HISTORY = 50;

interface EditorActions {
  // Project
  loadProject: (project: Project) => void;
  createProject: (name?: string) => void;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  saveProject: () => Promise<void>;

  // Pages
  addPage: (afterIndex?: number) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  reorderPages: (pageIds: string[]) => void;
  setCurrentPage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;

  // Elements
  addElement: (element: Omit<ScrapbookElement, 'id' | 'zIndex'>) => void;
  updateElement: (elementId: string, updates: Partial<ScrapbookElement>) => void;
  deleteElement: (elementId: string) => void;
  selectElement: (elementId: string, multi?: boolean) => void;
  deselectAll: () => void;
  moveElement: (elementId: string, x: number, y: number) => void;
  resizeElement: (elementId: string, width: number, height: number) => void;
  rotateElement: (elementId: string, rotation: number) => void;
  bringToFront: (elementId: string) => void;
  sendToBack: (elementId: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: (action: string) => void;

  // Clipboard
  copy: () => void;
  paste: () => void;
  cut: () => void;

  // UI
  setZoom: (zoom: number) => void;
  setPanel: (panel: EditorState['panel']) => void;
  setRightPanel: (panel: EditorState['rightPanel']) => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  toggleSnapToGrid: () => void;
  toggleSnapToGuides: () => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsResizing: (isResizing: boolean) => void;
  setIsRotating: (isRotating: boolean) => void;

  // Assets
  addAsset: (asset: ScrapbookElement) => void;
  removeAsset: (assetId: string) => void;
}

const useEditorStore = create<EditorState & EditorActions>()(
  immer((set, get) => {
    const debouncedSave = debounce(async () => {
      const state = get();
      if (!state.project) return;

      set((s) => { s.isSaving = true; });

      try {
        await projectService.updateProject(state.project.id, {
          ...state.project,
          pages: state.project.pages,
          updatedAt: new Date().toISOString(),
        });
        set((s) => { 
          s.isSaving = false; 
          s.lastSaved = new Date().toISOString();
        });
      } catch (error) {
        console.error('Autosave failed:', error);
        set((s) => { s.isSaving = false; });
      }
    }, 2000);

    return {
      // Initial state
      project: null,
      currentPageId: null,
      selectedElementIds: [],
      zoom: 1,
      showGrid: true,
      showGuides: true,
      snapToGrid: true,
      snapToGuides: true,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      clipboard: [],
      history: [],
      historyIndex: -1,
      isLoading: false,
      isSaving: false,
      lastSaved: null,
      panel: 'pages',
      rightPanel: 'properties',

      // Actions
      loadProject: (project) => {
        set((state) => {
          state.project = project;
          state.currentPageId = project.pages[0]?.id || null;
          state.selectedElementIds = [];
          state.history = [];
          state.historyIndex = -1;
          state.zoom = 1;
        });
        get().pushHistory('load-project');
      },

      createProject: (name) => {
        const project = createDefaultProject(name);
        set((state) => {
          state.project = project;
          state.currentPageId = project.pages[0]?.id || null;
          state.selectedElementIds = [];
          state.history = [];
          state.historyIndex = -1;
        });
        get().pushHistory('create-project');
      },

      updateProjectSettings: (settings) => {
        set((state) => {
          if (!state.project) return;
          Object.assign(state.project.settings, settings);
          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('update-settings');
        debouncedSave();
      },

      saveProject: async () => {
        const state = get();
        if (!state.project) return;

        set((s) => { s.isSaving = true; });

        try {
          await projectService.updateProject(state.project.id, state.project);
          set((s) => { 
            s.isSaving = false; 
            s.lastSaved = new Date().toISOString();
          });
        } catch (error) {
          console.error('Save failed:', error);
          set((s) => { s.isSaving = false; });
          throw error;
        }
      },

      addPage: (afterIndex) => {
        set((state) => {
          if (!state.project) return;

          const insertIndex = afterIndex !== undefined ? afterIndex + 1 : state.project.pages.length;
          const newPage = createDefaultPage(insertIndex);

          state.project.pages.splice(insertIndex, 0, newPage);

          // Reindex
          state.project.pages.forEach((page, idx) => {
            page.index = idx;
          });

          state.currentPageId = newPage.id;
          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('add-page');
        debouncedSave();
      },

      deletePage: (pageId) => {
        set((state) => {
          if (!state.project || state.project.pages.length <= 2) return;

          const index = state.project.pages.findIndex((p) => p.id === pageId);
          if (index === -1) return;

          state.project.pages.splice(index, 1);

          // Reindex
          state.project.pages.forEach((page, idx) => {
            page.index = idx;
          });

          if (state.currentPageId === pageId) {
            state.currentPageId = state.project.pages[Math.min(index, state.project.pages.length - 1)]?.id || null;
          }

          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('delete-page');
        debouncedSave();
      },

      duplicatePage: (pageId) => {
        set((state) => {
          if (!state.project) return;

          const page = state.project.pages.find((p) => p.id === pageId);
          if (!page) return;

          const newPage: Page = {
            ...deepClone(page),
            id: generateId(),
            index: page.index + 1,
            elements: page.elements.map((el) => ({ ...deepClone(el), id: generateId() })),
          };

          state.project.pages.splice(page.index + 1, 0, newPage);

          // Reindex
          state.project.pages.forEach((p, idx) => {
            p.index = idx;
          });

          state.currentPageId = newPage.id;
          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('duplicate-page');
        debouncedSave();
      },

      reorderPages: (pageIds) => {
        set((state) => {
          if (!state.project) return;

          const newPages: Page[] = [];
          pageIds.forEach((id) => {
            const page = state.project!.pages.find((p) => p.id === id);
            if (page) newPages.push(page);
          });

          state.project.pages = newPages;
          state.project.pages.forEach((page, idx) => {
            page.index = idx;
          });

          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('reorder-pages');
        debouncedSave();
      },

      setCurrentPage: (pageId) => {
        set((state) => {
          state.currentPageId = pageId;
          state.selectedElementIds = [];
        });
      },

      updatePage: (pageId, updates) => {
        set((state) => {
          if (!state.project) return;

          const page = state.project.pages.find((p) => p.id === pageId);
          if (!page) return;

          Object.assign(page, updates);
          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('update-page');
        debouncedSave();
      },

      addElement: (element) => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          const maxZ = Math.max(0, ...page.elements.map((el) => el.zIndex));
          const newElement: ScrapbookElement = {
            ...element,
            id: generateId(),
            zIndex: maxZ + 1,
          };

          page.elements.push(newElement);
          state.selectedElementIds = [newElement.id];
          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('add-element');
        debouncedSave();
      },

      updateElement: (elementId, updates) => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          const element = page.elements.find((el) => el.id === elementId);
          if (!element) return;

          Object.assign(element, updates);
          state.project.updatedAt = new Date().toISOString();
        });
        debouncedSave();
      },

      deleteElement: (elementId) => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          page.elements = page.elements.filter((el) => el.id !== elementId);
          state.selectedElementIds = state.selectedElementIds.filter((id) => id !== elementId);
          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('delete-element');
        debouncedSave();
      },

      selectElement: (elementId, multi = false) => {
        set((state) => {
          if (multi) {
            if (state.selectedElementIds.includes(elementId)) {
              state.selectedElementIds = state.selectedElementIds.filter((id) => id !== elementId);
            } else {
              state.selectedElementIds.push(elementId);
            }
          } else {
            state.selectedElementIds = [elementId];
          }
        });
      },

      deselectAll: () => {
        set((state) => {
          state.selectedElementIds = [];
        });
      },

      moveElement: (elementId, x, y) => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          const element = page.elements.find((el) => el.id === elementId);
          if (!element) return;

          element.x = x;
          element.y = y;
        });
      },

      resizeElement: (elementId, width, height) => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          const element = page.elements.find((el) => el.id === elementId);
          if (!element) return;

          element.width = width;
          element.height = height;
        });
      },

      rotateElement: (elementId, rotation) => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          const element = page.elements.find((el) => el.id === elementId);
          if (!element) return;

          element.rotation = rotation;
        });
      },

      bringToFront: (elementId) => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          const maxZ = Math.max(0, ...page.elements.map((el) => el.zIndex));
          const element = page.elements.find((el) => el.id === elementId);
          if (element) {
            element.zIndex = maxZ + 1;
          }
        });
        debouncedSave();
      },

      sendToBack: (elementId) => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          const minZ = Math.min(0, ...page.elements.map((el) => el.zIndex));
          const element = page.elements.find((el) => el.id === elementId);
          if (element) {
            element.zIndex = minZ - 1;
          }
        });
        debouncedSave();
      },

      pushHistory: (action) => {
        set((state) => {
          if (!state.project) return;

          // Remove future history if we're not at the end
          if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
          }

          const historyState: HistoryState = {
            pages: deepClone(state.project.pages),
            timestamp: Date.now(),
            action,
          };

          state.history.push(historyState);

          // Limit history size
          if (state.history.length > MAX_HISTORY) {
            state.history.shift();
          } else {
            state.historyIndex++;
          }
        });
      },

      undo: () => {
        set((state) => {
          if (state.historyIndex <= 0 || !state.project) return;

          state.historyIndex--;
          const historyState = state.history[state.historyIndex];
          state.project.pages = deepClone(historyState.pages);
          state.project.updatedAt = new Date().toISOString();

          // Update current page if it no longer exists
          const currentExists = state.project.pages.some((p) => p.id === state.currentPageId);
          if (!currentExists) {
            state.currentPageId = state.project.pages[0]?.id || null;
          }

          state.selectedElementIds = [];
        });
        debouncedSave();
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex >= state.history.length - 1 || !state.project) return;

          state.historyIndex++;
          const historyState = state.history[state.historyIndex];
          state.project.pages = deepClone(historyState.pages);
          state.project.updatedAt = new Date().toISOString();

          state.selectedElementIds = [];
        });
        debouncedSave();
      },

      copy: () => {
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          state.clipboard = page.elements
            .filter((el) => state.selectedElementIds.includes(el.id))
            .map((el) => deepClone(el));
        });
      },

      paste: () => {
        set((state) => {
          if (!state.project || !state.currentPageId || state.clipboard.length === 0) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          const maxZ = Math.max(0, ...page.elements.map((el) => el.zIndex));

          const newElements = state.clipboard.map((el, index) => ({
            ...deepClone(el),
            id: generateId(),
            x: el.x + 20,
            y: el.y + 20,
            zIndex: maxZ + index + 1,
          }));

          page.elements.push(...newElements);
          state.selectedElementIds = newElements.map((el) => el.id);
          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('paste');
        debouncedSave();
      },

      cut: () => {
        get().copy();
        set((state) => {
          if (!state.project || !state.currentPageId) return;

          const page = state.project.pages.find((p) => p.id === state.currentPageId);
          if (!page) return;

          page.elements = page.elements.filter(
            (el) => !state.selectedElementIds.includes(el.id)
          );
          state.selectedElementIds = [];
          state.project.updatedAt = new Date().toISOString();
        });
        get().pushHistory('cut');
        debouncedSave();
      },

      setZoom: (zoom) => {
        set((state) => {
          state.zoom = Math.max(0.1, Math.min(3, zoom));
        });
      },

      setPanel: (panel) => {
        set((state) => {
          state.panel = panel;
        });
      },

      setRightPanel: (panel) => {
        set((state) => {
          state.rightPanel = panel;
        });
      },

      toggleGrid: () => {
        set((state) => {
          state.showGrid = !state.showGrid;
        });
      },

      toggleGuides: () => {
        set((state) => {
          state.showGuides = !state.showGuides;
        });
      },

      toggleSnapToGrid: () => {
        set((state) => {
          state.snapToGrid = !state.snapToGrid;
        });
      },

      toggleSnapToGuides: () => {
        set((state) => {
          state.snapToGuides = !state.snapToGuides;
        });
      },

      setIsDragging: (isDragging) => {
        set((state) => {
          state.isDragging = isDragging;
        });
      },

      setIsResizing: (isResizing) => {
        set((state) => {
          state.isResizing = isResizing;
        });
      },

      setIsRotating: (isRotating) => {
        set((state) => {
          state.isRotating = isRotating;
        });
      },

      addAsset: (asset) => {
        set((state) => {
          if (!state.project) return;
          state.project.assets.push(asset as unknown as import('@/types').Asset);
        });
      },

      removeAsset: (assetId) => {
        set((state) => {
          if (!state.project) return;
          state.project.assets = state.project.assets.filter((a) => a.id !== assetId);
        });
      },
    };
  })
);

export default useEditorStore;
