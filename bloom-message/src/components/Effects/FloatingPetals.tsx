'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

export default function FloatingPetals() {
  const phase = useStore((s) => s.phase);
  const theme = useStore((s) => s.theme);
  const groupRef = useRef<THREE.Group>(null!);

  const PETAL_COLORS: Record<string, string> = {
    romantic: '#ffb6c1',
    birthday: '#ffd700',
    anniversary: '#ff6b6b',
    congratulations: '#ff8c00',
    friendship: '#dda0dd',
  };

  const count = 30;

  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.03, 0.02, 0.04, 0.06, 0.02, 0.1);
    shape.bezierCurveTo(0.01, 0.11, -0.01, 0.11, -0.02, 0.1);
    shape.bezierCurveTo(-0.04, 0.06, -0.03, 0.02, 0, 0);
    return new THREE.ShapeGeometry(shape, 6);
  }, []);

  const petalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(PETAL_COLORS[theme] || '#ffb6c1'),
    roughness: 0.4,
    metalness: 0.02,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  }), [theme]);

  // Initial positions and velocities
  const petals = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: Math.random() * 6 + 2,
      z: (Math.random() - 0.5) * 8,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -0.2 - Math.random() * 0.3,
      speedRot: (Math.random() - 0.5) * 2,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const shouldShow = ['particles', 'camera', 'message', 'idle'].includes(phase);
    groupRef.current.visible = shouldShow;

    if (!shouldShow) return;

    const time = Date.now() * 0.001;

    groupRef.current.children.forEach((mesh, i) => {
      const petal = petals[i];

      // Wind effect
      petal.x += (petal.speedX + Math.sin(time * 0.5 + petal.phase) * 0.3) * delta;
      petal.y += petal.speedY * delta;
      petal.z += Math.cos(time * 0.3 + petal.phase) * 0.2 * delta;

      // Tumble
      petal.rotX += petal.speedRot * delta;
      petal.rotY += petal.speedRot * 0.7 * delta;

      // Reset if fallen too low
      if (petal.y < -1) {
        petal.y = 6 + Math.random() * 2;
        petal.x = (Math.random() - 0.5) * 8;
        petal.z = (Math.random() - 0.5) * 8;
      }

      mesh.position.set(petal.x, petal.y, petal.z);
      mesh.rotation.set(petal.rotX, petal.rotY, petal.rotZ);
    });
  });

  return (
    <group ref={groupRef}>
      {petals.map((_, i) => (
        <mesh key={i} geometry={petalGeometry} material={petalMaterial} />
      ))}
    </group>
  );
}
