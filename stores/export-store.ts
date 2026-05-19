import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ExportJob, ExportConfig } from '@/types';

interface ExportState {
  jobs: ExportJob[];
  currentConfig: ExportConfig;
  isExporting: boolean;
  exportProgress: number;

  // Actions
  setCurrentConfig: (config: Partial<ExportConfig>) => void;
  addJob: (job: ExportJob) => void;
  updateJob: (jobId: string, updates: Partial<ExportJob>) => void;
  setIsExporting: (isExporting: boolean) => void;
  setExportProgress: (progress: number) => void;
  removeJob: (jobId: string) => void;
}

const defaultConfig: ExportConfig = {
  format: 'pdf',
  quality: 'high',
  fps: 30,
  includeAudio: false,
};

const useExportStore = create<ExportState>()(
  immer((set) => ({
    jobs: [],
    currentConfig: defaultConfig,
    isExporting: false,
    exportProgress: 0,

    setCurrentConfig: (config) => {
      set((state) => {
        Object.assign(state.currentConfig, config);
      });
    },

    addJob: (job) => {
      set((state) => {
        state.jobs.unshift(job);
      });
    },

    updateJob: (jobId, updates) => {
      set((state) => {
        const job = state.jobs.find((j) => j.id === jobId);
        if (job) {
          Object.assign(job, updates);
        }
      });
    },

    setIsExporting: (isExporting) => {
      set((state) => {
        state.isExporting = isExporting;
      });
    },

    setExportProgress: (progress) => {
      set((state) => {
        state.exportProgress = Math.max(0, Math.min(100, progress));
      });
    },

    removeJob: (jobId) => {
      set((state) => {
        state.jobs = state.jobs.filter((j) => j.id !== jobId);
      });
    },
  }))
);

export default useExportStore;
