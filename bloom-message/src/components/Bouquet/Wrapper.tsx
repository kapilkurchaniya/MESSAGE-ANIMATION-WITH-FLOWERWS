'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

export default function Wrapper() {
  const phase = useStore((s) => s.phase);
  const theme = useStore((s) => s.theme);

  const WRAPPER_COLORS: Record<string, string> = {
    romantic: '#f5e6d3',
    birthday: '#e8f5e9',
    anniversary: '#fce4ec',
    congratulations: '#fff8e1',
    friendship: '#f3e5f5',
  };

  const wrapperColor = WRAPPER_COLORS[theme] || '#f5e6d3';

  const coneGeometry = useMemo(() => {
    // A broad, open cone lets the stems sit inside a real bouquet sleeve.
    return new THREE.ConeGeometry(0.84, 1.72, 48, 1, true);
  }, []);

  const wrapperMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(wrapperColor),
      roughness: 0.8,
      metalness: 0.0,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1,
      clearcoat: 0.15,
      clearcoatRoughness: 0.65,
    });
  }, [wrapperColor]);

  const rimGeometry = useMemo(() => new THREE.TorusGeometry(0.84, 0.032, 10, 48), []);
  const rimMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(wrapperColor).offsetHSL(0, 0, 0.12),
    roughness: 0.55,
    clearcoat: 0.25,
  }), [wrapperColor]);

  const visible = ['bouquet', 'ribbon', 'particles', 'camera', 'message', 'idle'].includes(phase);

  return (
    <group visible={visible}>
      <mesh
        geometry={coneGeometry}
        material={wrapperMaterial}
        position={[0, 0.86, 0]}
        rotation={[Math.PI, 0, 0]}
      />
      {/* Finished paper edge at the open end of the bouquet sleeve. */}
      <mesh
        geometry={rimGeometry}
        material={rimMaterial}
        position={[0, 1.72, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}
