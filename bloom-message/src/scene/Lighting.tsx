'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, Theme } from '@/store/useStore';

const THEME_LIGHTING: Record<Theme, {
  ambientIntensity: number;
  ambientColor: string;
  directionalColor: string;
  directionalIntensity: number;
  rimColor: string;
}> = {
  romantic: {
    ambientIntensity: 0.4,
    ambientColor: '#ffe0f0',
    directionalColor: '#ffd4e5',
    directionalIntensity: 1.5,
    rimColor: '#ff69b4',
  },
  birthday: {
    ambientIntensity: 0.5,
    ambientColor: '#fff8e7',
    directionalColor: '#fffacd',
    directionalIntensity: 1.8,
    rimColor: '#ffd700',
  },
  anniversary: {
    ambientIntensity: 0.35,
    ambientColor: '#ffe8e0',
    directionalColor: '#ffcccb',
    directionalIntensity: 1.4,
    rimColor: '#ff4444',
  },
  congratulations: {
    ambientIntensity: 0.5,
    ambientColor: '#fffff0',
    directionalColor: '#fff8dc',
    directionalIntensity: 1.6,
    rimColor: '#ffd700',
  },
  friendship: {
    ambientIntensity: 0.45,
    ambientColor: '#f0f8ff',
    directionalColor: '#e6e6fa',
    directionalIntensity: 1.3,
    rimColor: '#9370db',
  },
};

export default function Lighting() {
  const theme = useStore((s) => s.theme);
  const phase = useStore((s) => s.phase);
  const directionalRef = useRef<THREE.DirectionalLight>(null!);
  const rimRef = useRef<THREE.PointLight>(null!);

  const config = THEME_LIGHTING[theme];

  useFrame((_, delta) => {
    if (!rimRef.current) return;

    // Gentle pulsing rim light
    const time = Date.now() * 0.001;
    rimRef.current.intensity = 0.8 + Math.sin(time * 2) * 0.2;

    // Move rim light slowly
    rimRef.current.position.x = Math.cos(time * 0.5) * 4;
    rimRef.current.position.z = Math.sin(time * 0.5) * 4;
  });

  return (
    <>
      {/* Environment map for reflections */}
      <Environment preset="sunset" environmentIntensity={0.3} />

      {/* Ambient fill */}
      <ambientLight
        color={config.ambientColor}
        intensity={config.ambientIntensity}
      />

      {/* Key directional light */}
      <directionalLight
        ref={directionalRef}
        position={[5, 8, 5]}
        intensity={config.directionalIntensity}
        color={config.directionalColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.001}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-3, 4, -3]}
        intensity={0.4}
        color="#b0c4de"
      />

      {/* Rim/accent light */}
      <pointLight
        ref={rimRef}
        position={[3, 4, 3]}
        intensity={0.8}
        color={config.rimColor}
        distance={10}
        decay={2}
      />

      {/* Bottom fill to avoid pure black shadows */}
      <hemisphereLight
        color="#87ceeb"
        groundColor="#2d1b45"
        intensity={0.3}
      />
    </>
  );
}
