'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

export default function MagicParticles() {
  const phase = useStore((s) => s.phase);
  const theme = useStore((s) => s.theme);
  const pointsRef = useRef<THREE.Points>(null!);

  const MAGIC_COLORS: Record<string, string> = {
    romantic: '#ff69b4',
    birthday: '#ffd700',
    anniversary: '#ff4444',
    congratulations: '#ff8c00',
    friendship: '#9370db',
  };

  const count = 150;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Start from center
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = 2 + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;

      // Radial explosion velocity
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.3) * Math.PI;
      const speed = 1 + Math.random() * 2;
      velocities[i * 3] = Math.cos(angle) * Math.cos(elevation) * speed;
      velocities[i * 3 + 1] = Math.sin(elevation) * speed;
      velocities[i * 3 + 2] = Math.sin(angle) * Math.cos(elevation) * speed;
    }

    return { positions, velocities };
  }, []);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: MAGIC_COLORS[theme] || '#ff69b4',
      size: 0.04,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, [theme]);

  const explosionTime = useRef(-1);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const isExplosion = phase === 'particles';
    const shouldGlow = ['camera', 'message', 'idle'].includes(phase);

    if (isExplosion && explosionTime.current < 0) {
      explosionTime.current = 0;
      // Reset positions to center
      const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArray[i * 3] = (Math.random() - 0.5) * 0.3;
        posArray[i * 3 + 1] = 2;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      }
    }

    if (isExplosion || shouldGlow) {
      explosionTime.current += delta;

      const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const t = explosionTime.current;

      material.opacity = Math.max(0, 1 - t * 0.15);

      for (let i = 0; i < count; i++) {
        posArray[i * 3] += velocities[i * 3] * delta * Math.max(0, 1 - t * 0.3);
        posArray[i * 3 + 1] += velocities[i * 3 + 1] * delta * Math.max(0, 1 - t * 0.3);
        posArray[i * 3 + 1] -= delta * 0.5; // Gravity
        posArray[i * 3 + 2] += velocities[i * 3 + 2] * delta * Math.max(0, 1 - t * 0.3);
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (!isExplosion && !shouldGlow) {
      material.opacity *= 0.95;
      explosionTime.current = -1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
}
