'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

export default function Sparkles() {
  const phase = useStore((s) => s.phase);
  const pointsRef = useRef<THREE.Points>(null!);

  const count = 200;

  const { positions, sizes, opacities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      sizes[i] = Math.random() * 3 + 1;
      opacities[i] = Math.random();
    }

    return { positions, sizes, opacities };
  }, []);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#fffacd',
      size: 0.05,
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
    const targetOpacity = shouldShow ? 0.8 : 0;
    material.opacity += (targetOpacity - material.opacity) * 2 * delta;

    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = Date.now() * 0.001;

    for (let i = 0; i < count; i++) {
      // Gentle floating
      posArray[i * 3 + 1] += Math.sin(time + i) * 0.002;
      posArray[i * 3] += Math.cos(time * 0.5 + i * 0.3) * 0.001;

      // Reset if too high
      if (posArray[i * 3 + 1] > 6) {
        posArray[i * 3 + 1] = -0.5;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Slow rotation
    pointsRef.current.rotation.y += delta * 0.02;
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
