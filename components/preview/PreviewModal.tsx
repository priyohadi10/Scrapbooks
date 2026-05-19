'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import useEditorStore from '@/stores/editor-store';
import useUIStore from '@/stores/ui-store';

function BookPage({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[2, 3]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
  );
}

function Book({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [pageRotation, setPageRotation] = useState(0);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Book cover */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.1, 3.1, 0.1]} />
        <meshStandardMaterial color="#564538" roughness={0.9} />
      </mesh>

      {/* Pages */}
      {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
        const isCurrent = i === currentPage;
        const offset = (i - currentPage) * 0.01;

        return (
          <BookPage
            key={i}
            position={[offset, 0, offset]}
            rotation={[0, isCurrent ? pageRotation : 0, 0]}
            color={isCurrent ? '#faf9f7' : '#f0ede8'}
          />
        );
      })}

      {/* Spine */}
      <mesh position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 3.1, 16]} />
        <meshStandardMaterial color="#4b3c32" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function PreviewModal() {
  const { project, currentPageId } = useEditorStore();
  const { setShowPreview } = useUIStore();
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUI, setShowUI] = useState(true);

  const currentPage = project?.pages.find((p) => p.id === currentPageId);
  const currentIndex = project?.pages.findIndex((p) => p.id === currentPageId) || 0;
  const totalPages = project?.pages.length || 0;

  useEffect(() => {
    setCurrentPreviewPage(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPreviewPage((prev) => (prev + 1) % totalPages);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalPages]);

  const handlePrev = () => {
    setCurrentPreviewPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    setCurrentPreviewPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={() => setShowPreview(false)}
    >
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-auto my-auto" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={() => setShowPreview(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-smooth"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 3D Canvas */}
        <div className="w-full h-full rounded-xl overflow-hidden">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Book currentPage={currentPreviewPage} totalPages={totalPages} />
            <OrbitControls enablePan={false} enableZoom={true} minDistance={3} maxDistance={8} />
            <Environment preset="studio" />
          </Canvas>
        </div>

        {/* UI Overlay */}
        <AnimatePresence>
          {showUI && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full"
            >
              <button
                onClick={handlePrev}
                className="p-2 hover:bg-white/10 rounded-full text-white transition-smooth"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-white/10 rounded-full text-white transition-smooth"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <span className="text-white text-sm font-medium min-w-[80px] text-center">
                {currentPreviewPage + 1} / {totalPages}
              </span>

              <button
                onClick={handleNext}
                className="p-2 hover:bg-white/10 rounded-full text-white transition-smooth"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page indicator dots */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {project?.pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPreviewPage(i)}
              className={`w-2 h-2 rounded-full transition-smooth ${
                i === currentPreviewPage ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
