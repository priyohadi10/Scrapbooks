# Digital Scrapbook Studio

A production-ready web application for creating professional cinematic scrapbooks with realistic 3D preview, PDF export, and MP4 video export capabilities.

## Features

- **Professional Editor**: Drag-and-drop canvas with Konva.js, supporting images, text, shapes, and ornaments
- **3D Preview**: Realistic book flip simulation using Three.js and React Three Fiber
- **Export System**: PDF generation with jsPDF and MP4 video export
- **Page Management**: Add, delete, duplicate, reorder pages with drag-and-drop
- **Asset System**: Upload and manage images, ornaments, textures, and backgrounds
- **Undo/Redo**: Full history stack with 50 states
- **Keyboard Shortcuts**: Full keyboard support for power users
- **Autosave**: Automatic project saving with debounce
- **Responsive UI**: Modern dark-themed interface with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Editor Engine**: Konva.js (React Konva)
- **3D Preview**: Three.js, React Three Fiber, Drei
- **Animation**: Framer Motion
- **State Management**: Zustand with Immer
- **Backend**: Supabase (Auth, Storage, Database)
- **Export**: jsPDF, html2canvas
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for backend features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-scrapbook-studio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/`
3. Set up Storage buckets: `assets`, `projects`
4. Configure Row Level Security (RLS) policies

## Project Structure

```
digital-scrapbook-studio/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard route group
│   ├── editor/             # Editor page
│   ├── settings/           # Settings page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── dashboard/          # Dashboard components
│   ├── editor/             # Editor components
│   │   ├── canvas/         # Konva canvas
│   │   ├── panels/         # Side panels
│   │   └── toolbar/        # Top toolbar
│   ├── preview/            # 3D preview modal
│   └── export/             # Export modal
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── lib/
│   ├── supabase/           # Supabase client & services
│   └── utils/              # Utility functions
├── types/                  # TypeScript types
├── public/                 # Static assets
└── styles/                 # Additional styles
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save project |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + C` | Copy selected elements |
| `Ctrl/Cmd + V` | Paste elements |
| `Ctrl/Cmd + X` | Cut elements |
| `Delete/Backspace` | Delete selected elements |
| `Escape` | Deselect all |
| `Ctrl/Cmd + =` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `Ctrl/Cmd + 0` | Reset zoom |
| `Arrow Keys` | Nudge selected elements |
| `Shift + Arrow Keys` | Nudge 10px |

## Architecture

### Editor Engine
- Handles all canvas interactions (drag, drop, resize, rotate)
- Uses Konva.js for high-performance 2D rendering
- Supports multi-select with selection box
- Snap to grid and guides

### Preview Engine
- Separate Three.js scene for 3D book visualization
- Realistic page flip animation
- Hardcover simulation with materials
- Orbit controls for camera movement

### Export Engine
- Canvas-based rendering for consistent output
- PDF export using jsPDF with per-page rendering
- MP4 export using frame sequence generation
- Progress tracking for long operations

### State Management
- Zustand stores for UI, Editor, and Export state
- Immer for immutable state updates
- History stack for undo/redo
- Debounced autosave to Supabase

## Performance Considerations

- Lazy loading for heavy components (Preview, Export)
- Canvas-based rendering avoids DOM manipulation
- Throttled mouse events
- Optimized re-renders with Zustand selectors
- Image compression before upload

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

## Roadmap

### V1 (Current)
- [x] Stable editor with drag/drop/resize/rotate
- [x] Page management system
- [x] Basic shapes and text
- [x] 3D preview with Three.js
- [x] PDF export
- [x] MP4 export (frame sequence)
- [x] Undo/redo system
- [x] Autosave
- [x] Keyboard shortcuts

### V2 (Planned)
- [ ] Image upload and asset library
- [ ] Advanced animations
- [ ] Template system
- [ ] Audio support
- [ ] Real-time collaboration
- [ ] Remotion integration for video

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.
