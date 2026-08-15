'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowerRef } from './Rose';

interface TulipProps {
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Tulip = forwardRef<FlowerRef, TulipProps>(({
  color = '#e17055',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const stemRef = useRef<THREE.Mesh>(null!);
  const petalGroupRef = useRef<THREE.Group>(null!);
  const leafGroupRef = useRef<THREE.Group>(null!);
  const bloomProgress = useRef(0);
  const stemProgress = useRef(0);

  useImperativeHandle(ref, () => ({
    group: groupRef.current,
    setBloom: (t: number) => { bloomProgress.current = t; },
    setStemGrow: (t: number) => { stemProgress.current = t; },
  }));

  const stemGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.7, 0),
      new THREE.Vector3(0.02, 1.4, 0),
      new THREE.Vector3(0, 2.1, 0),
      new THREE.Vector3(-0.01, 2.5, 0),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.035, 8, false);
  }, []);

  // Tulip petal: cup-shaped
  const petalGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 15; i++) {
      const t = i / 15;
      // Cup shape
      const x = Math.sin(t * Math.PI * 0.9) * 0.25 * (0.5 + t);
      const y = t * 0.8;
      points.push(new THREE.Vector2(x, y));
    }
    return new THREE.LatheGeometry(points, 6, 0, Math.PI * 0.95);
  }, []);

  // Tulip leaf: long, blade-like
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.12, 0.3, 0.08, 0.8, 0, 1.2);
    shape.bezierCurveTo(-0.08, 0.8, -0.12, 0.3, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  const petalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      roughness: 0.25,
      metalness: 0.0,
      transmission: 0.4,
      thickness: 0.8,
      ior: 1.5,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide,
    });
  }, [color]);

  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2d5016', roughness: 0.7, metalness: 0.1,
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3a7d28', roughness: 0.6, side: THREE.DoubleSide,
  }), []);

  const petalCount = 6;

  useFrame(() => {
    if (!groupRef.current) return;
    const bloom = bloomProgress.current;
    const stemGrow = stemProgress.current;

    if (stemRef.current) {
      stemRef.current.scale.y = stemGrow;
      stemRef.current.visible = stemGrow > 0.01;
    }

    if (leafGroupRef.current) {
      leafGroupRef.current.children.forEach((leaf, i) => {
        const lp = Math.max(0, Math.min(1, (stemGrow - 0.2 - i * 0.2) * 3));
        leaf.scale.setScalar(lp * 0.6);
        (leaf as THREE.Mesh).visible = lp > 0.01;
      });
    }

    if (petalGroupRef.current) {
      petalGroupRef.current.visible = bloom > 0.01;
      petalGroupRef.current.children.forEach((petal, i) => {
        const pp = Math.max(0, Math.min(1, (bloom - i * 0.05) * 2));
        const angle = (i / petalCount) * Math.PI * 2;
        petal.scale.setScalar(pp * 0.45);
        // Cup open animation
        const openAngle = pp * 0.4;
        petal.rotation.set(-openAngle, angle, 0);
        const r = 0.08 * pp;
        petal.position.set(
          Math.cos(angle) * r,
          2.5,
          Math.sin(angle) * r
        );
      });
    }

    // Idle sway
    const time = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(time + position[0] * 3) * 0.04;
    groupRef.current.rotation.x = Math.cos(time * 0.8 + position[2]) * 0.025;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={stemRef} geometry={stemGeometry} material={stemMaterial} />
      <group ref={leafGroupRef}>
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.08, 0.3, 0]} rotation={[0, 0, -0.15]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[-0.08, 0.7, 0]} rotation={[0, Math.PI, 0.15]} scale={0} />
      </group>
      <group ref={petalGroupRef}>
        {Array.from({ length: petalCount }, (_, i) => (
          <mesh key={i} geometry={petalGeometry} material={petalMaterial} scale={0} />
        ))}
      </group>
    </group>
  );
});

Tulip.displayName = 'Tulip';
export default Tulip;
