'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowerRef } from './Rose';

interface LilyProps {
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Lily = forwardRef<FlowerRef, LilyProps>(({
  color = '#ffffff',
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
      new THREE.Vector3(0.03, 0.6, 0),
      new THREE.Vector3(-0.02, 1.2, 0.02),
      new THREE.Vector3(0.01, 1.8, -0.01),
      new THREE.Vector3(0, 2.2, 0),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.03, 8, false);
  }, []);

  // Lily petal: star-shaped, recurved (longer, narrower)
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.12, 0.15, 0.15, 0.5, 0.05, 0.9);
    shape.bezierCurveTo(0.02, 1.0, -0.02, 1.0, -0.05, 0.9);
    shape.bezierCurveTo(-0.15, 0.5, -0.12, 0.15, 0, 0);
    const geom = new THREE.ShapeGeometry(shape, 12);
    return geom;
  }, []);

  // Stamen
  const stamenGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.02, 0.3, 0),
      new THREE.Vector3(0, 0.5, 0),
    ]);
    return new THREE.TubeGeometry(curve, 8, 0.008, 4, false);
  }, []);

  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.08, 0.2, 0.06, 0.6, 0, 0.9);
    shape.bezierCurveTo(-0.06, 0.6, -0.08, 0.2, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  const petalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.25,
    metalness: 0.0,
    transmission: 0.4,
    thickness: 0.8,
    ior: 1.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  }), [color]);

  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2d5016', roughness: 0.7,
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3a7d28', roughness: 0.6, side: THREE.DoubleSide,
  }), []);

  const stamenMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8B7D3C', roughness: 0.5,
  }), []);

  const petalCount = 6;
  const stamenCount = 6;

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
        const lp = Math.max(0, Math.min(1, (stemGrow - 0.25 - i * 0.2) * 3));
        leaf.scale.setScalar(lp * 0.7);
        (leaf as THREE.Mesh).visible = lp > 0.01;
      });
    }

    if (petalGroupRef.current) {
      petalGroupRef.current.visible = bloom > 0.01;
      const allChildren = petalGroupRef.current.children;
      // Petals
      for (let i = 0; i < petalCount; i++) {
        const petal = allChildren[i];
        if (!petal) continue;
        const pp = Math.max(0, Math.min(1, (bloom - i * 0.04) * 1.8));
        const angle = (i / petalCount) * Math.PI * 2;
        petal.scale.setScalar(pp * 0.5);
        // Star recurve - petals bend backward
        const recurve = pp * 0.6;
        petal.rotation.set(-Math.PI * 0.3 - recurve, angle, 0);
        const r = 0.1 * pp;
        petal.position.set(Math.cos(angle) * r, 2.2, Math.sin(angle) * r);
      }
      // Stamens
      for (let i = 0; i < stamenCount; i++) {
        const stamen = allChildren[petalCount + i];
        if (!stamen) continue;
        const sp = Math.max(0, Math.min(1, (bloom - 0.3) * 2));
        const angle = (i / stamenCount) * Math.PI * 2 + 0.3;
        stamen.scale.setScalar(sp);
        const r = 0.05 * sp;
        stamen.position.set(Math.cos(angle) * r, 2.2, Math.sin(angle) * r);
        stamen.rotation.set(-0.3, angle, 0);
      }
    }

    const time = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(time + position[0] * 2) * 0.025;
    groupRef.current.rotation.x = Math.cos(time * 0.6 + position[2]) * 0.02;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={stemRef} geometry={stemGeometry} material={stemMaterial} />
      <group ref={leafGroupRef}>
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.1, 0.5, 0]} rotation={[0, 0, -0.3]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[-0.1, 0.9, 0]} rotation={[0, Math.PI, 0.25]} scale={0} />
      </group>
      <group ref={petalGroupRef}>
        {Array.from({ length: petalCount }, (_, i) => (
          <mesh key={`petal-${i}`} geometry={petalGeometry} material={petalMaterial} scale={0} />
        ))}
        {Array.from({ length: stamenCount }, (_, i) => (
          <mesh key={`stamen-${i}`} geometry={stamenGeometry} material={stamenMaterial} scale={0} />
        ))}
      </group>
    </group>
  );
});

Lily.displayName = 'Lily';
export default Lily;
