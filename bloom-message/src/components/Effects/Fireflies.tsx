'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

export default function Fireflies() {
  const phase = useStore((s) => s.phase);
  const pointsRef = useRef<THREE.Points>(null!);

  const count = 50;

  const { positions, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 4 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      speeds[i] = 0.3 + Math.random() * 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, speeds, phases };
  }, []);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#ffff66',
      size: 0.08,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const shouldShow = ['particles', 'camera', 'message', 'idle'].includes(phase);
    const targetOpacity = shouldShow ? 0.9 : 0;
    material.opacity += (targetOpacity - material.opacity) * 2 * delta;

    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = Date.now() * 0.001;

    for (let i = 0; i < count; i++) {
      const speed = speeds[i];
      const ph = phases[i];

      // Random wandering paths
      posArray[i * 3] += Math.sin(time * speed + ph) * 0.005;
      posArray[i * 3 + 1] += Math.cos(time * speed * 0.7 + ph * 2) * 0.003;
      posArray[i * 3 + 2] += Math.sin(time * speed * 0.5 + ph * 3) * 0.005;

      // Keep in bounds
      if (Math.abs(posArray[i * 3]) > 5) posArray[i * 3] *= 0.99;
      if (posArray[i * 3 + 1] > 5 || posArray[i * 3 + 1] < 0.3) {
        posArray[i * 3 + 1] = 2 + Math.random() * 2;
      }
      if (Math.abs(posArray[i * 3 + 2]) > 5) posArray[i * 3 + 2] *= 0.99;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Pulsing size (firefly glow)
    material.size = 0.06 + Math.sin(time * 3) * 0.02;
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
