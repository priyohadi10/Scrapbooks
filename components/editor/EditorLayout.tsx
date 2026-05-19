'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import TopToolbar from './toolbar/TopToolbar';
import LeftPanel from './panels/LeftPanel';
import RightPanel from './panels/RightPanel';
import BottomPanel from './panels/BottomPanel';
import useUIStore from '@/stores/ui-store';

const PreviewModal = dynamic(() => import('@/components/preview/PreviewModal'), {
  ssr: false,
});

const ExportModal = dynamic(() => import('@/components/export/ExportModal'), {
  ssr: false,
});

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  const showPreview = useUIStore((state) => state.showPreview);
  const showExport = useUIStore((state) => state.showExport);

  return (
    <div className="h-screen flex flex-col bg-editor-bg text-white overflow-hidden">
      <TopToolbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
            {children}
          </div>
          <BottomPanel />
        </div>
        <RightPanel />
      </div>
      {showPreview && <PreviewModal />}
      {showExport && <ExportModal />}
    </div>
  );
}
