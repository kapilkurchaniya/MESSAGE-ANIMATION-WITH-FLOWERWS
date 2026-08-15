'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowerRef } from './Rose';

interface OrchidProps {
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Orchid = forwardRef<FlowerRef, OrchidProps>(({
  color = '#9b59b6',
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
      new THREE.Vector3(0.08, 0.5, 0),
      new THREE.Vector3(0.12, 1.0, 0.03),
      new THREE.Vector3(0.06, 1.6, 0),
      new THREE.Vector3(0, 2.0, -0.02),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.025, 8, false);
  }, []);

  // Large dorsal sepal
  const dorsalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.15, 0.1, 0.18, 0.4, 0.08, 0.7);
    shape.bezierCurveTo(0.03, 0.75, -0.03, 0.75, -0.08, 0.7);
    shape.bezierCurveTo(-0.18, 0.4, -0.15, 0.1, 0, 0);
    return new THREE.ShapeGeometry(shape, 12);
  }, []);

  // Lateral petal (asymmetric)
  const lateralGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.12, 0.05, 0.2, 0.2, 0.15, 0.5);
    shape.bezierCurveTo(0.1, 0.55, -0.05, 0.55, -0.1, 0.45);
    shape.bezierCurveTo(-0.15, 0.2, -0.1, 0.05, 0, 0);
    return new THREE.ShapeGeometry(shape, 10);
  }, []);

  // Lip/labellum (the distinctive orchid lip)
  const lipGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0.05, 0.25, 0.15, 0.2, 0.3);
    shape.bezierCurveTo(0.15, 0.4, 0.05, 0.45, 0, 0.4);
    shape.bezierCurveTo(-0.05, 0.45, -0.15, 0.4, -0.2, 0.3);
    shape.bezierCurveTo(-0.25, 0.15, -0.2, 0.05, 0, 0);
    return new THREE.ShapeGeometry(shape, 12);
  }, []);

  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.1, 0.15, 0.12, 0.5, 0, 0.8);
    shape.bezierCurveTo(-0.12, 0.5, -0.1, 0.15, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  const petalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.2,
    metalness: 0.0,
    transmission: 0.5,
    thickness: 1.0,
    ior: 1.5,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  }), [color]);

  const lipMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0.05, 0.1, -0.1),
    roughness: 0.25,
    metalness: 0.0,
    transmission: 0.4,
    thickness: 1.2,
    ior: 1.5,
    clearcoat: 0.5,
    side: THREE.DoubleSide,
  }), [color]);

  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3d6b2e', roughness: 0.7,
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2d6b1e', roughness: 0.5, side: THREE.DoubleSide,
  }), []);

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
        const lp = Math.max(0, Math.min(1, (stemGrow - 0.3 - i * 0.2) * 3));
        leaf.scale.setScalar(lp * 0.8);
        (leaf as THREE.Mesh).visible = lp > 0.01;
      });
    }

    if (petalGroupRef.current) {
      petalGroupRef.current.visible = bloom > 0.01;
      const children = petalGroupRef.current.children;

      // Dorsal sepal (top)
      if (children[0]) {
        const dp = Math.max(0, Math.min(1, bloom * 1.5));
        children[0].scale.setScalar(dp * 0.55);
        children[0].position.set(0, 2.05, -0.05);
        children[0].rotation.set(-0.2, 0, 0);
      }

      // Lateral sepals
      [1, 2].forEach((idx, i) => {
        if (!children[idx]) return;
        const lp = Math.max(0, Math.min(1, (bloom - 0.1) * 1.5));
        const side = i === 0 ? 1 : -1;
        children[idx].scale.setScalar(lp * 0.45);
        children[idx].position.set(side * 0.15 * lp, 2.0, 0.05);
        children[idx].rotation.set(0.3, side * 0.5, side * 0.4 * lp);
      });

      // Lateral petals (narrower)
      [3, 4].forEach((idx, i) => {
        if (!children[idx]) return;
        const pp = Math.max(0, Math.min(1, (bloom - 0.2) * 1.5));
        const side = i === 0 ? 1 : -1;
        children[idx].scale.setScalar(pp * 0.4);
        children[idx].position.set(side * 0.12 * pp, 2.1, -0.02);
        children[idx].rotation.set(-0.1, side * 0.3, side * 0.6 * pp);
      });

      // Lip/labellum
      if (children[5]) {
        const lip = Math.max(0, Math.min(1, (bloom - 0.3) * 2));
        children[5].scale.setScalar(lip * 0.5);
        children[5].position.set(0, 1.95, 0.1);
        children[5].rotation.set(0.6 * lip, 0, 0);
      }
    }

    const time = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(time * 0.8 + position[0]) * 0.03;
    groupRef.current.rotation.x = Math.cos(time * 0.5) * 0.02;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={stemRef} geometry={stemGeometry} material={stemMaterial} />
      <group ref={leafGroupRef}>
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.1, 0.3, 0]} rotation={[0, 0, -0.5]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[-0.1, 0.6, 0]} rotation={[0, Math.PI, 0.4]} scale={0} />
      </group>
      <group ref={petalGroupRef}>
        {/* Dorsal sepal */}
        <mesh geometry={dorsalGeometry} material={petalMaterial} scale={0} />
        {/* Lateral sepals */}
        <mesh geometry={lateralGeometry} material={petalMaterial} scale={0} />
        <mesh geometry={lateralGeometry} material={petalMaterial} scale={0} />
        {/* Lateral petals */}
        <mesh geometry={lateralGeometry} material={petalMaterial} scale={0} />
        <mesh geometry={lateralGeometry} material={petalMaterial} scale={0} />
        {/* Lip */}
        <mesh geometry={lipGeometry} material={lipMaterial} scale={0} />
      </group>
    </group>
  );
});

Orchid.displayName = 'Orchid';
export default Orchid;
