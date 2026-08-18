'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowerRef } from './Rose';

interface SunflowerProps {
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Sunflower = forwardRef<FlowerRef, SunflowerProps>(({
  color = '#f1c40f',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const stemRef = useRef<THREE.Mesh>(null!);
  const petalGroupRef = useRef<THREE.Group>(null!);
  const centerRef = useRef<THREE.Mesh>(null!);
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
      new THREE.Vector3(0.04, 0.8, 0),
      new THREE.Vector3(-0.02, 1.6, 0.02),
      new THREE.Vector3(0.01, 2.4, -0.01),
      new THREE.Vector3(0, 2.8, 0),
    ]);
    return new THREE.TubeGeometry(curve, 24, 0.06, 8, false);
  }, []);

  // Ray petal geometry
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.06, 0.05, 0.08, 0.3, 0.04, 0.55);
    shape.bezierCurveTo(0.02, 0.6, -0.02, 0.6, -0.04, 0.55);
    shape.bezierCurveTo(-0.08, 0.3, -0.06, 0.05, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  // Center disc
  const centerGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  }, []);

  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0.15, 0.25, 0.5, 0, 0.8);
    shape.bezierCurveTo(-0.25, 0.5, -0.2, 0.15, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  const petalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.35,
    metalness: 0.0,
    transmission: 0.2,
    thickness: 0.6,
    ior: 1.5,
    clearcoat: 0.2,
    side: THREE.DoubleSide,
  }), [color]);

  const centerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5D3A1A',
    roughness: 0.8,
    metalness: 0.1,
  }), []);

  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2d5016', roughness: 0.7,
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3a7d28', roughness: 0.6, side: THREE.DoubleSide,
  }), []);

  const rayCount = 20;

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
        const lp = Math.max(0, Math.min(1, (stemGrow - 0.2 - i * 0.15) * 3));
        leaf.scale.setScalar(lp);
        (leaf as THREE.Mesh).visible = lp > 0.01;
      });
    }

    if (centerRef.current) {
      const cp = Math.max(0, Math.min(1, bloom * 2));
      centerRef.current.scale.setScalar(cp);
      centerRef.current.visible = cp > 0.01;
      centerRef.current.position.y = 2.8;
    }

    if (petalGroupRef.current) {
      petalGroupRef.current.visible = bloom > 0.1;
      petalGroupRef.current.children.forEach((petal, i) => {
        const pp = Math.max(0, Math.min(1, (bloom - 0.2 - i * 0.02) * 2));
        const angle = (i / rayCount) * Math.PI * 2;
        petal.scale.setScalar(pp * 0.7);
        petal.rotation.set(-Math.PI * 0.35, angle, 0);
        const r = 0.25 * pp;
        petal.position.set(
          Math.cos(angle) * r,
          2.8,
          Math.sin(angle) * r
        );
      });
    }

    const time = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(time + position[0] * 2) * 0.02;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={stemRef} geometry={stemGeometry} material={stemMaterial} />
      <group ref={leafGroupRef}>
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.15, 0.8, 0]} rotation={[0, 0, -0.4]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[-0.18, 1.4, 0]} rotation={[0, Math.PI, 0.35]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.12, 2.0, 0.05]} rotation={[0.1, 0.3, -0.3]} scale={0} />
      </group>
      <mesh ref={centerRef} geometry={centerGeometry} material={centerMaterial} scale={0} />
      <group ref={petalGroupRef}>
        {Array.from({ length: rayCount }, (_, i) => (
          <mesh key={i} geometry={petalGeometry} material={petalMaterial} scale={0} />
        ))}
      </group>
    </group>
  );
});

Sunflower.displayName = 'Sunflower';
export default Sunflower;
