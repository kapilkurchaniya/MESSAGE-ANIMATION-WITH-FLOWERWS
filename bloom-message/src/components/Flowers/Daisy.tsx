'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowerRef } from './Rose';

interface DaisyProps {
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Daisy = forwardRef<FlowerRef, DaisyProps>(({
  color = '#ffffff',
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
      new THREE.Vector3(0.03, 0.4, 0.01),
      new THREE.Vector3(-0.02, 0.8, 0),
      new THREE.Vector3(0.01, 1.2, -0.01),
      new THREE.Vector3(0, 1.6, 0),
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.025, 8, false);
  }, []);

  // Flat narrow petal
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.04, 0.05, 0.05, 0.2, 0.03, 0.4);
    shape.bezierCurveTo(0.01, 0.42, -0.01, 0.42, -0.03, 0.4);
    shape.bezierCurveTo(-0.05, 0.2, -0.04, 0.05, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  const centerGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  }, []);

  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.1, 0.1, 0.12, 0.3, 0, 0.45);
    shape.bezierCurveTo(-0.12, 0.3, -0.1, 0.1, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  const petalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.3,
    metalness: 0.0,
    transmission: 0.3,
    thickness: 0.5,
    ior: 1.5,
    clearcoat: 0.3,
    side: THREE.DoubleSide,
  }), [color]);

  const centerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f39c12',
    roughness: 0.6,
    emissive: '#f39c12',
    emissiveIntensity: 0.2,
  }), []);

  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a8f2a', roughness: 0.7,
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a8f2a', roughness: 0.6, side: THREE.DoubleSide,
  }), []);

  const petalCount = 18;

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
        const lp = Math.max(0, Math.min(1, (stemGrow - 0.3 - i * 0.15) * 3));
        leaf.scale.setScalar(lp * 0.6);
        (leaf as THREE.Mesh).visible = lp > 0.01;
      });
    }

    if (centerRef.current) {
      const cp = Math.max(0, Math.min(1, bloom * 1.5));
      centerRef.current.scale.setScalar(cp);
      centerRef.current.visible = cp > 0.01;
      centerRef.current.position.y = 1.6;
    }

    if (petalGroupRef.current) {
      petalGroupRef.current.visible = bloom > 0.05;
      petalGroupRef.current.children.forEach((petal, i) => {
        const pp = Math.max(0, Math.min(1, (bloom - 0.15 - i * 0.015) * 2.5));
        const angle = (i / petalCount) * Math.PI * 2;
        petal.scale.setScalar(pp * 0.55);
        // Flat lay - petals nearly horizontal
        petal.rotation.set(-Math.PI * 0.45, angle, 0);
        const r = 0.12 * pp;
        petal.position.set(Math.cos(angle) * r, 1.6, Math.sin(angle) * r);
      });
    }

    const time = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(time * 1.2 + position[0] * 4) * 0.04;
    groupRef.current.rotation.x = Math.cos(time + position[2] * 3) * 0.03;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={stemRef} geometry={stemGeometry} material={stemMaterial} />
      <group ref={leafGroupRef}>
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.08, 0.3, 0]} rotation={[0, 0, -0.3]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[-0.07, 0.6, 0]} rotation={[0, Math.PI, 0.25]} scale={0} />
      </group>
      <mesh ref={centerRef} geometry={centerGeometry} material={centerMaterial} scale={0} />
      <group ref={petalGroupRef}>
        {Array.from({ length: petalCount }, (_, i) => (
          <mesh key={i} geometry={petalGeometry} material={petalMaterial} scale={0} />
        ))}
      </group>
    </group>
  );
});

Daisy.displayName = 'Daisy';
export default Daisy;
