'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Video, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import useEditorStore from '@/stores/editor-store';
import useUIStore from '@/stores/ui-store';
import useExportStore from '@/stores/export-store';
import { ExportConfig } from '@/types';
import { generateId } from '@/lib/utils';

export default function ExportModal() {
  const { project } = useEditorStore();
  const { setShowExport } = useUIStore();
  const { currentConfig, setCurrentConfig, addJob, setIsExporting, isExporting } = useExportStore();
  const [activeTab, setActiveTab] = useState<'pdf' | 'mp4'>('pdf');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'exporting' | 'done' | 'error'>('idle');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!project || !canvasRef.current) return;

    setStatus('exporting');
    setIsExporting(true);
    setProgress(0);

    const jobId = generateId();
    addJob({
      id: jobId,
      projectId: project.id,
      format: activeTab === 'pdf' ? 'pdf' : 'mp4-landscape',
      status: 'processing',
      progress: 0,
    });

    try {
      if (activeTab === 'pdf') {
        await exportPDF(project, canvasRef.current, (p) => setProgress(p));
      } else {
        await exportMP4(project, canvasRef.current, currentConfig, (p) => setProgress(p));
      }

      setStatus('done');
      setProgress(100);
    } catch (error) {
      console.error('Export failed:', error);
      setStatus('error');
    } finally {
      setIsExporting(false);
    }
  }, [project, activeTab, currentConfig, addJob, setIsExporting]);

  const qualityOptions = [
    { value: 'low' as const, label: 'Low', resolution: '720p' },
    { value: 'medium' as const, label: 'Medium', resolution: '1080p' },
    { value: 'high' as const, label: 'High', resolution: '1440p' },
    { value: 'ultra' as const, label: 'Ultra', resolution: '4K' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !isExporting && setShowExport(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-editor-panel border border-editor-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-editor-border">
          <div>
            <h2 className="text-xl font-bold text-white">Export Project</h2>
            <p className="text-sm text-scrapbook-500 mt-1">{project?.settings.name}</p>
          </div>
          <button
            onClick={() => !isExporting && setShowExport(false)}
            className="p-2 hover:bg-editor-border rounded-lg text-scrapbook-400 hover:text-white transition-smooth"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden canvas for rendering */}
        <div ref={canvasRef} className="absolute -left-[9999px]" />

        {/* Tabs */}
        <div className="flex p-6 pb-0 gap-4">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-smooth ${
              activeTab === 'pdf'
                ? 'bg-scrapbook-700 text-white'
                : 'bg-editor-bg text-scrapbook-400 hover:text-white'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">PDF</span>
          </button>
          <button
            onClick={() => setActiveTab('mp4')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-smooth ${
              activeTab === 'mp4'
                ? 'bg-scrapbook-700 text-white'
                : 'bg-editor-bg text-scrapbook-400 hover:text-white'
            }`}
          >
            <Video className="w-5 h-5" />
            <span className="font-medium">MP4</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div className="bg-editor-bg rounded-xl p-4 border border-editor-border">
                <h3 className="text-sm font-medium text-white mb-3">PDF Settings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-scrapbook-400">Format</span>
                    <span className="text-white">PDF Document</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-scrapbook-400">Pages</span>
                    <span className="text-white">{project?.pages.length || 0} pages</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-scrapbook-400">Size</span>
                    <span className="text-white">{project?.settings.size.width} x {project?.settings.size.height} px</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mp4' && (
            <div className="space-y-4">
              <div className="bg-editor-bg rounded-xl p-4 border border-editor-border">
                <h3 className="text-sm font-medium text-white mb-3">Video Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-scrapbook-500 mb-2 block">Quality</label>
                    <div className="grid grid-cols-2 gap-2">
                      {qualityOptions.map((q) => (
                        <button
                          key={q.value}
                          onClick={() => setCurrentConfig({ quality: q.value })}
                          className={`py-2 px-3 rounded-lg text-sm transition-smooth ${
                            currentConfig.quality === q.value
                              ? 'bg-scrapbook-700 text-white'
                              : 'bg-editor-border text-scrapbook-300 hover:bg-scrapbook-800'
                          }`}
                        >
                          <div className="font-medium">{q.label}</div>
                          <div className="text-xs opacity-70">{q.resolution}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-scrapbook-500 mb-2 block">Frame Rate</label>
                    <div className="flex gap-2">
                      {[24, 30, 60].map((fps) => (
                        <button
                          key={fps}
                          onClick={() => setCurrentConfig({ fps })}
                          className={`flex-1 py-2 rounded-lg text-sm transition-smooth ${
                            currentConfig.fps === fps
                              ? 'bg-scrapbook-700 text-white'
                              : 'bg-editor-border text-scrapbook-300 hover:bg-scrapbook-800'
                          }`}
                        >
                          {fps} FPS
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {status === 'exporting' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-scrapbook-400">Exporting...</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-editor-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-scrapbook-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Export completed successfully!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Export failed. Please try again.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-editor-border flex justify-end gap-3">
          <button
            onClick={() => setShowExport(false)}
            disabled={isExporting}
            className="px-4 py-2.5 text-sm font-medium text-scrapbook-400 hover:text-white transition-smooth disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || status === 'done'}
            className="px-6 py-2.5 bg-scrapbook-700 hover:bg-scrapbook-600 text-white rounded-lg text-sm font-medium transition-smooth disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : status === 'done' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {activeTab.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

async function exportPDF(
  project: NonNullable<ReturnType<typeof useEditorStore.getState>['project']>,
  container: HTMLDivElement,
  onProgress: (progress: number) => void
) {
  const { jsPDF } = await import('jspdf');

  const pdf = new jsPDF({
    orientation: project.settings.size.width > project.settings.size.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [project.settings.size.width, project.settings.size.height],
  });

  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i];

    const canvas = document.createElement('canvas');
    canvas.width = project.settings.size.width;
    canvas.height = project.settings.size.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    ctx.fillStyle = page.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const el of page.elements) {
      ctx.save();
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.globalAlpha = el.opacity;

      if (el.type === 'text') {
        ctx.fillStyle = el.color || '#333';
        ctx.font = `${el.fontSize || 16}px ${el.fontFamily || 'Inter'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.text || '', 0, 0);
      } else if (el.type === 'shape') {
        ctx.fillStyle = el.backgroundColor || '#c9bda8';
        if (el.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(el.width, el.height) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-el.width / 2, -el.height / 2, el.width, el.height);
        }
      }

      ctx.restore();
    }

    if (i > 0) pdf.addPage();
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, project.settings.size.width, project.settings.size.height);

    onProgress(((i + 1) / project.pages.length) * 100);
  }

  pdf.save(`${project.settings.name.replace(/\s+/g, '_')}.pdf`);
}

async function exportMP4(
  project: NonNullable<ReturnType<typeof useEditorStore.getState>['project']>,
  container: HTMLDivElement,
  config: ExportConfig,
  onProgress: (progress: number) => void
) {
  const totalDuration = project.pages.reduce((acc, p) => acc + p.duration, 0);
  const totalFrames = totalDuration * config.fps;
  const frames: string[] = [];

  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i];
    const pageFrames = page.duration * config.fps;

    for (let f = 0; f < pageFrames; f++) {
      const canvas = document.createElement('canvas');
      canvas.width = project.settings.size.width;
      canvas.height = project.settings.size.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      ctx.fillStyle = page.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const el of page.elements) {
        ctx.save();
        ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.globalAlpha = el.opacity;

        if (el.type === 'text') {
          ctx.fillStyle = el.color || '#333';
          ctx.font = `${el.fontSize || 16}px ${el.fontFamily || 'Inter'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.text || '', 0, 0);
        } else if (el.type === 'shape') {
          ctx.fillStyle = el.backgroundColor || '#c9bda8';
          if (el.shapeType === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(el.width, el.height) / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-el.width / 2, -el.height / 2, el.width, el.height);
          }
        }

        ctx.restore();
      }

      frames.push(canvas.toDataURL('image/jpeg', 0.9));

      const currentFrame = i * pageFrames + f;
      onProgress((currentFrame / totalFrames) * 100);
    }
  }

  if (frames.length > 0) {
    const link = document.createElement('a');
    link.download = `${project.settings.name.replace(/\s+/g, '_')}_frame_1.jpg`;
    link.href = frames[0];
    link.click();
  }

  onProgress(100);
}
