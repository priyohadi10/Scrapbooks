import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  sidebarCollapsed: boolean;
  showPreview: boolean;
  showExport: boolean;
  showSettings: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  modal: { type: string; data?: unknown } | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setShowExport: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
}

const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarCollapsed: false,
    showPreview: false,
    showExport: false,
    showSettings: false,
    toast: null,
    modal: null,

    toggleSidebar: () => {
      set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      });
    },

    setSidebarCollapsed: (collapsed) => {
      set((state) => {
        state.sidebarCollapsed = collapsed;
      });
    },

    setShowPreview: (show) => {
      set((state) => {
        state.showPreview = show;
        if (show) {
          state.showExport = false;
          state.showSettings = false;
        }
      });
    },

    setShowExport: (show) => {
      set((state) => {
        state.showExport = show;
        if (show) {
          state.showPreview = false;
          state.showSettings = false;
        }
      });
    },

    setShowSettings: (show) => {
      set((state) => {
        state.showSettings = show;
        if (show) {
          state.showPreview = false;
          state.showExport = false;
        }
      });
    },

    showToast: (message, type = 'info') => {
      set((state) => {
        state.toast = { message, type };
      });
      setTimeout(() => {
        set((state) => {
          state.toast = null;
        });
      }, 3000);
    },

    clearToast: () => {
      set((state) => {
        state.toast = null;
      });
    },

    openModal: (type, data) => {
      set((state) => {
        state.modal = { type, data };
      });
    },

    closeModal: () => {
      set((state) => {
        state.modal = null;
      });
    },
  }))
);

export default useUIStore;
