'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import * as THREE from 'three';

import Camera from './Camera';
import Lighting from './Lighting';
import Controls from './Controls';

import Sparkles from '@/components/Effects/Sparkles';
import FloatingPetals from '@/components/Effects/FloatingPetals';
import Fireflies from '@/components/Effects/Fireflies';
import Butterflies from '@/components/Effects/Butterflies';
import FloralFrame from '@/components/Effects/FloralFrame';
import FlyingFlowers from '@/components/Effects/FlyingFlowers';

import Garden from '@/components/Environment/Garden';
import { useStore } from '@/store/useStore';

export default function Experience() {
  const phase = useStore((s) => s.phase);

  // Don't render canvas during landing/input/loading
  const show3D = !['landing', 'input', 'loading'].includes(phase);

  return (
    <div
      className="fixed inset-0"
      style={{
        opacity: show3D ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        pointerEvents: show3D ? 'auto' : 'none',
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Camera />
          <Lighting />
          <Controls />

          {/* Environment */}
          <Garden />

          {/* Floral atmosphere for the animated message. */}
          <Sparkles />
          <FlyingFlowers />
          <FloatingPetals />
          <Fireflies />
          <Butterflies />
          <FloralFrame />

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
