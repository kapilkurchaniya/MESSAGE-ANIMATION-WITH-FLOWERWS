'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

export default function Garden() {
  const theme = useStore((s) => s.theme);

  const GROUND_COLORS: Record<string, string> = {
    romantic: '#2d1b2e',
    birthday: '#1a2d1a',
    anniversary: '#2d1a1a',
    congratulations: '#2d2d1a',
    friendship: '#1a1a2d',
  };

  const groundColor = GROUND_COLORS[theme] || '#2d1b2e';

  const groundGeometry = useMemo(() => {
    return new THREE.CircleGeometry(15, 32);
  }, []);

  const groundMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(groundColor),
      roughness: 0.9,
      metalness: 0.0,
    });
  }, [groundColor]);

  return (
    <group>
      {/* Ground plane */}
      <mesh
        geometry={groundGeometry}
        material={groundMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      />

      {/* Fog effect via gradient sphere */}
      <mesh position={[0, 5, 0]}>
        <sphereGeometry args={[20, 16, 16]} />
        <meshBasicMaterial
          color="#0a0a15"
          side={THREE.BackSide}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
