'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import EditorLayout from '@/components/editor/EditorLayout';
import useEditorStore from '@/stores/editor-store';

// Dynamic import for heavy components
const EditorCanvas = dynamic(() => import('@/components/editor/canvas/EditorCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-editor-bg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scrapbook-400" />
    </div>
  ),
});

function EditorContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const project = useEditorStore((state) => state.project);
  const loadProject = useEditorStore((state) => state.loadProject);
  const createProject = useEditorStore((state) => state.createProject);

  useEffect(() => {
    if (!project && !projectId) {
      createProject('New Project');
    }
  }, [project, projectId, createProject, loadProject]);

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-editor-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scrapbook-400" />
      </div>
    );
  }

  return (
    <EditorLayout>
      <EditorCanvas />
    </EditorLayout>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-editor-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scrapbook-400" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
