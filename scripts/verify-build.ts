import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('=== Digital Scrapbook Studio - Build Verification ===\n');

const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

const pkgPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('ERROR: package.json not found');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
console.log(`Project: ${pkg.name} v${pkg.version}`);

const requiredDeps = [
  'next', 'react', 'react-dom', 'typescript', 'tailwindcss',
  'konva', 'react-konva', 'three', '@react-three/fiber',
  '@react-three/drei', 'framer-motion', 'zustand', 'immer',
  'jspdf', 'lucide-react',
];

const missingDeps = requiredDeps.filter(dep => !pkg.dependencies[dep]);
if (missingDeps.length > 0) {
  console.warn(`\nWARNING: Missing dependencies: ${missingDeps.join(', ')}`);
} else {
  console.log('\nAll required dependencies present ✓');
}

const requiredFiles = [
  'app/layout.tsx', 'app/globals.css',
  'app/(dashboard)/dashboard/page.tsx', 'app/editor/page.tsx',
  'app/settings/page.tsx', 'middleware.ts',
  'types/index.ts', 'stores/editor-store.ts',
  'components/editor/EditorLayout.tsx',
  'components/editor/canvas/EditorCanvas.tsx',
];

console.log('\nFile structure check:');
let allFilesExist = true;
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allFilesExist = false;
}

if (allFilesExist) {
  console.log('\nAll required files present ✓');
} else {
  console.error('\nERROR: Some required files are missing');
}

console.log('\n=== Verification Complete ===');
