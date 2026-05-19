'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus, FolderOpen, Settings, HardDrive, Clock, 
  Image, FileText, Video, ChevronRight, Trash2, Copy
} from 'lucide-react';
import useEditorStore from '@/stores/editor-store';
import useUIStore from '@/stores/ui-store';
import { Project } from '@/types';
import { generateId, formatBytes } from '@/lib/utils';

// Mock projects for initial state
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    userId: 'user-1',
    settings: {
      name: 'Wedding Memories',
      bookType: 'landscape',
      size: { width: 1200, height: 800, unit: 'px' },
      cover: { material: 'linen', title: 'Wedding Memories' },
      pageDuration: 5,
      defaultPaperType: 'matte',
      defaultTransition: 'fade',
    },
    pages: [],
    assets: [],
    exportConfig: { format: 'pdf', quality: 'high', fps: 30, includeAudio: false },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    thumbnail: '/assets/mock-wedding.jpg',
  },
  {
    id: 'proj-2',
    userId: 'user-1',
    settings: {
      name: 'Baby First Year',
      bookType: 'square',
      size: { width: 1000, height: 1000, unit: 'px' },
      cover: { material: 'canvas', title: 'Baby First Year' },
      pageDuration: 4,
      defaultPaperType: 'glossy',
      defaultTransition: 'slide',
    },
    pages: [],
    assets: [],
    exportConfig: { format: 'mp4-landscape', quality: 'high', fps: 30, includeAudio: true },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-10T16:00:00Z',
    thumbnail: '/assets/mock-baby.jpg',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isLoading, setIsLoading] = useState(false);
  const createProject = useEditorStore((state) => state.createProject);
  const loadProject = useEditorStore((state) => state.loadProject);
  const showToast = useUIStore((state) => state.showToast);

  const totalStorage = projects.reduce((acc, proj) => {
    return acc + (proj.assets?.reduce((a, asset) => a + (asset.size || 0), 0) || 0);
  }, 0);

  const handleCreateProject = () => {
    const name = `Project ${projects.length + 1}`;
    createProject(name);
    const newProject = useEditorStore.getState().project;
    if (newProject) {
      setProjects((prev) => [newProject, ...prev]);
      router.push(`/editor?project=${newProject.id}`);
      showToast('Project created successfully', 'success');
    }
  };

  const handleOpenProject = (project: Project) => {
    loadProject(project);
    router.push(`/editor?project=${project.id}`);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    showToast('Project deleted', 'info');
  };

  const handleDuplicateProject = (project: Project) => {
    const duplicated: Project = {
      ...project,
      id: generateId(),
      settings: { ...project.settings, name: `${project.settings.name} (Copy)` },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [duplicated, ...prev]);
    showToast('Project duplicated', 'success');
  };

  return (
    <div className="min-h-screen bg-scrapbook-50">
      {/* Header */}
      <header className="bg-white border-b border-scrapbook-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-scrapbook-800 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-scrapbook-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-scrapbook-900">Digital Scrapbook Studio</h1>
              <p className="text-xs text-scrapbook-500">Professional Cinematic Rendering</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/settings')}
              className="p-2 text-scrapbook-600 hover:text-scrapbook-900 hover:bg-scrapbook-100 rounded-lg transition-smooth"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-scrapbook-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold text-scrapbook-900 mb-2">Welcome back, Admin</h2>
          <p className="text-scrapbook-600 mb-6">Create stunning scrapbooks with cinematic quality</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-scrapbook-200 panel-shadow">
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen className="w-5 h-5 text-scrapbook-600" />
                <span className="text-sm font-medium text-scrapbook-600">Total Projects</span>
              </div>
              <p className="text-3xl font-bold text-scrapbook-900">{projects.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-scrapbook-200 panel-shadow">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="w-5 h-5 text-scrapbook-600" />
                <span className="text-sm font-medium text-scrapbook-600">Storage Used</span>
              </div>
              <p className="text-3xl font-bold text-scrapbook-900">{formatBytes(totalStorage)}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-scrapbook-200 panel-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-scrapbook-600" />
                <span className="text-sm font-medium text-scrapbook-600">Recent Activity</span>
              </div>
              <p className="text-3xl font-bold text-scrapbook-900">{projects.length > 0 ? 'Today' : 'None'}</p>
            </div>
          </div>

          <button
            onClick={handleCreateProject}
            className="inline-flex items-center gap-2 bg-scrapbook-800 hover:bg-scrapbook-900 text-white px-6 py-3 rounded-xl font-medium transition-smooth panel-shadow"
          >
            <Plus className="w-5 h-5" />
            Create New Project
          </button>
        </motion.section>

        {/* Recent Projects */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-scrapbook-900">Recent Projects</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm text-scrapbook-600 hover:text-scrapbook-900 hover:bg-scrapbook-100 rounded-lg transition-smooth">
                All
              </button>
              <button className="px-3 py-1.5 text-sm text-scrapbook-600 hover:text-scrapbook-900 hover:bg-scrapbook-100 rounded-lg transition-smooth">
                PDF
              </button>
              <button className="px-3 py-1.5 text-sm text-scrapbook-600 hover:text-scrapbook-900 hover:bg-scrapbook-100 rounded-lg transition-smooth">
                MP4
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-xl border border-scrapbook-200 overflow-hidden panel-shadow hover:shadow-lg transition-smooth"
              >
                <div 
                  onClick={() => handleOpenProject(project)}
                  className="aspect-[4/3] bg-scrapbook-100 relative cursor-pointer overflow-hidden"
                >
                  {project.thumbnail ? (
                    <div className="w-full h-full bg-gradient-to-br from-scrapbook-200 to-scrapbook-300 flex items-center justify-center">
                      <Image className="w-12 h-12 text-scrapbook-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-scrapbook-200 to-scrapbook-300 flex items-center justify-center">
                      <Image className="w-12 h-12 text-scrapbook-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-smooth" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-smooth">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateProject(project);
                        }}
                        className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-scrapbook-700 shadow-sm"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-red-600 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-scrapbook-900 mb-1">{project.settings.name}</h4>
                      <p className="text-xs text-scrapbook-500">
                        {new Date(project.updatedAt).toLocaleDateString()} • {project.pages.length || 0} pages
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-scrapbook-400">
                      {project.exportConfig.format === 'pdf' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Video className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-scrapbook-100 text-scrapbook-700 rounded-md capitalize">
                      {project.settings.bookType}
                    </span>
                    <span className="text-xs px-2 py-1 bg-scrapbook-100 text-scrapbook-700 rounded-md capitalize">
                      {project.settings.cover.material}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
