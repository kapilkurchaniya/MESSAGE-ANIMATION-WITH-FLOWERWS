'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

export default function Camera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const phase = useStore((s) => s.phase);

  // Camera target positions for different phases
  const targetPosition = useRef(new THREE.Vector3(0, 5, 12));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.5, 0));

  useFrame((_, delta) => {
    if (!cameraRef.current) return;

    // Smoothly interpolate camera position
    const lerpSpeed = 1.5 * delta;

    switch (phase) {
      case 'landing':
      case 'input':
      case 'loading':
        targetPosition.current.set(0, 6, 14);
        targetLookAt.current.set(0, 1, 0);
        break;
      case 'seed':
        targetPosition.current.set(0, 2, 6);
        targetLookAt.current.set(0, 0.5, 0);
        break;
      case 'stem':
        targetPosition.current.set(2, 3, 5);
        targetLookAt.current.set(0, 1.5, 0);
        break;
      case 'bloom':
        targetPosition.current.set(1.5, 3, 4);
        targetLookAt.current.set(0, 2, 0);
        break;
      case 'bouquet':
        targetPosition.current.set(0, 3.5, 5);
        targetLookAt.current.set(0, 2, 0);
        break;
      case 'ribbon':
        targetPosition.current.set(-1, 2.5, 4);
        targetLookAt.current.set(0, 1.5, 0);
        break;
      case 'particles':
        targetPosition.current.set(0, 3, 5);
        targetLookAt.current.set(0, 2.5, 0);
        break;
      case 'camera':
        // Orbit around the bouquet
        const time = Date.now() * 0.0003;
        targetPosition.current.set(
          Math.cos(time) * 5,
          3,
          Math.sin(time) * 5
        );
        targetLookAt.current.set(0, 2, 0);
        break;
      case 'message':
        targetPosition.current.set(0, 3.5, 4);
        targetLookAt.current.set(0, 3.5, 0);
        break;
      case 'idle':
        // Slow orbit
        const t = Date.now() * 0.0001;
        targetPosition.current.set(
          Math.cos(t) * 6,
          3.5,
          Math.sin(t) * 6
        );
        targetLookAt.current.set(0, 2, 0);
        break;
    }

    cameraRef.current.position.lerp(targetPosition.current, lerpSpeed);

    // Smooth look-at using quaternion interpolation
    const currentLookAt = new THREE.Vector3();
    cameraRef.current.getWorldDirection(currentLookAt);
    const targetDir = targetLookAt.current.clone().sub(cameraRef.current.position).normalize();

    const currentQuat = cameraRef.current.quaternion.clone();
    const lookAtMatrix = new THREE.Matrix4().lookAt(
      cameraRef.current.position,
      targetLookAt.current,
      new THREE.Vector3(0, 1, 0)
    );
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(lookAtMatrix);

    cameraRef.current.quaternion.slerpQuaternions(currentQuat, targetQuat, lerpSpeed);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 5, 12]}
      fov={45}
      near={0.1}
      far={100}
    />
  );
}
