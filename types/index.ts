export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Shadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface Animation {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'none';
  duration: number;
  delay: number;
  easing: string;
}

export type ElementType = 'image' | 'text' | 'ornament' | 'shape' | 'sticker';

export interface ScrapbookElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  shadow?: Shadow;
  animation?: Animation;
  // Type-specific properties
  src?: string; // for images
  text?: string; // for text
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  ornamentType?: string;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  stickerType?: string;
  // Asset reference
  assetId?: string;
}

export type PaperType = 'matte' | 'glossy' | 'textured' | 'kraft' | 'linen';
export type TransitionType = 'none' | 'fade' | 'slide' | 'curl' | 'flip';

export interface Page {
  id: string;
  index: number;
  duration: number;
  paperType: PaperType;
  transition: TransitionType;
  backgroundColor: string;
  backgroundImage?: string;
  elements: ScrapbookElement[];
  thumbnail?: string;
}

export type BookType = 'landscape' | 'portrait' | 'square' | 'vertical' | 'story';
export type CoverMaterial = 'canvas' | 'leather' | 'glossy' | 'linen' | 'kraft' | 'matte';

export interface CoverDesign {
  frontCover?: string;
  backCover?: string;
  spineCover?: string;
  material: CoverMaterial;
  texture?: string;
  title?: string;
  subtitle?: string;
}

export interface BookSize {
  width: number;
  height: number;
  unit: 'px' | 'mm' | 'in';
}

export interface ProjectSettings {
  name: string;
  bookType: BookType;
  size: BookSize;
  cover: CoverDesign;
  pageDuration: number;
  defaultPaperType: PaperType;
  defaultTransition: TransitionType;
}

export interface Asset {
  id: string;
  type: 'image' | 'ornament' | 'texture' | 'background' | 'audio';
  name: string;
  src: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  size?: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface ExportConfig {
  format: 'pdf' | 'mp4-landscape' | 'mp4-vertical';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  fps: number;
  includeAudio: boolean;
  backgroundMusic?: string;
}

export interface Project {
  id: string;
  userId: string;
  settings: ProjectSettings;
  pages: Page[];
  assets: Asset[];
  exportConfig: ExportConfig;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

export interface EditorState {
  project: Project | null;
  currentPageId: string | null;
  selectedElementIds: string[];
  zoom: number;
  showGrid: boolean;
  showGuides: boolean;
  snapToGrid: boolean;
  snapToGuides: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  clipboard: ScrapbookElement[];
  history: HistoryState[];
  historyIndex: number;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  panel: 'pages' | 'photos' | 'text' | 'ornament' | 'background' | 'cover' | 'animation' | 'audio';
  rightPanel: 'properties' | 'layers' | 'none';
}

export interface HistoryState {
  pages: Page[];
  timestamp: number;
  action: string;
}

export interface ExportJob {
  id: string;
  projectId: string;
  format: ExportConfig['format'];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  url?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'wedding' | 'birthday' | 'graduation' | 'travel' | 'baby' | 'memory' | 'retro' | 'journal';
  thumbnail: string;
  settings: ProjectSettings;
  pages: Omit<Page, 'id'>[];
  isDefault: boolean;
}
