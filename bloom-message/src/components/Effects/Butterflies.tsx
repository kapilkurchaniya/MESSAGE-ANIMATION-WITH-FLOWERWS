'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

interface ButterflyData {
  position: THREE.Vector3;
  target: THREE.Vector3;
  speed: number;
  wingSpeed: number;
  wingPhase: number;
  color: string;
  scale: number;
}

export default function Butterflies() {
  const phase = useStore((s) => s.phase);
  const groupRef = useRef<THREE.Group>(null!);

  const count = 5;

  const wingGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.1, 0.08, 0.2, 0.15, 0.15, 0.05);
    shape.bezierCurveTo(0.18, -0.02, 0.12, -0.08, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  const butterflies = useMemo<ButterflyData[]>(() => {
    const colors = ['#ff6b9d', '#c39bd3', '#85c1e9', '#f9e79f', '#abebc6'];
    return Array.from({ length: count }, (_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 4
      ),
      target: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 4
      ),
      speed: 0.5 + Math.random() * 0.5,
      wingSpeed: 8 + Math.random() * 4,
      wingPhase: Math.random() * Math.PI * 2,
      color: colors[i % colors.length],
      scale: 0.3 + Math.random() * 0.2,
    }));
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const shouldShow = ['particles', 'camera', 'message', 'idle'].includes(phase);
    groupRef.current.visible = shouldShow;

    if (!shouldShow) return;

    const time = Date.now() * 0.001;

    groupRef.current.children.forEach((group, i) => {
      const data = butterflies[i];

      // Move toward target
      data.position.lerp(data.target, data.speed * delta);

      // Pick new target when close
      if (data.position.distanceTo(data.target) < 0.3) {
        data.target.set(
          (Math.random() - 0.5) * 5,
          1.5 + Math.random() * 4,
          (Math.random() - 0.5) * 5
        );
      }

      group.position.copy(data.position);

      // Face direction of movement
      const dir = data.target.clone().sub(data.position).normalize();
      if (dir.length() > 0.01) {
        group.lookAt(data.target);
      }

      // Wing flap
      const wingAngle = Math.sin(time * data.wingSpeed + data.wingPhase) * 0.7;
      const wings = group.children;
      if (wings[0]) wings[0].rotation.y = wingAngle;
      if (wings[1]) wings[1].rotation.y = -wingAngle;
    });
  });

  return (
    <group ref={groupRef}>
      {butterflies.map((data, i) => {
        const material = new THREE.MeshPhysicalMaterial({
          color: data.color,
          roughness: 0.3,
          metalness: 0.1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });

        return (
          <group key={i} scale={data.scale}>
            {/* Left wing */}
            <mesh geometry={wingGeometry} material={material} />
            {/* Right wing (mirrored) */}
            <mesh geometry={wingGeometry} material={material} scale={[-1, 1, 1]} />
          </group>
        );
      })}
    </group>
  );
}
