'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowerRef } from './Rose';

interface LotusProps {
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Lotus = forwardRef<FlowerRef, LotusProps>(({
  color = '#f8c8dc',
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
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(0, 1.0, 0),
      new THREE.Vector3(0, 1.5, 0),
    ]);
    return new THREE.TubeGeometry(curve, 12, 0.035, 8, false);
  }, []);

  // Bowl-shaped petal
  const petalGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 15; i++) {
      const t = i / 15;
      const x = Math.sin(t * Math.PI) * 0.2 * (0.3 + t * 0.7);
      const y = t * 0.65;
      points.push(new THREE.Vector2(x, y));
    }
    return new THREE.LatheGeometry(points, 6, 0, Math.PI * 0.85);
  }, []);

  const centerGeometry = useMemo(() => {
    return new THREE.ConeGeometry(0.1, 0.15, 8);
  }, []);

  // Pad-like leaf
  const leafGeometry = useMemo(() => {
    return new THREE.CircleGeometry(0.4, 16, 0, Math.PI * 1.8);
  }, []);

  const petalMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.25,
    metalness: 0.0,
    transmission: 0.45,
    thickness: 0.9,
    ior: 1.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.3,
    side: THREE.DoubleSide,
  }), [color]);

  const centerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c8a600',
    roughness: 0.5,
    emissive: '#c8a600',
    emissiveIntensity: 0.15,
  }), []);

  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3d6b2e', roughness: 0.7,
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a5c2a', roughness: 0.5, side: THREE.DoubleSide,
  }), []);

  const petalLayers = useMemo(() => {
    const configs: { count: number; scale: number; tiltMax: number; yOffset: number }[] = [
      { count: 5, scale: 0.5, tiltMax: 0.2, yOffset: 0 },
      { count: 7, scale: 0.65, tiltMax: 0.4, yOffset: 0.03 },
      { count: 8, scale: 0.8, tiltMax: 0.65, yOffset: 0.06 },
    ];
    const result: { angle: number; scale: number; tiltMax: number; yOffset: number; layerIdx: number }[] = [];
    configs.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        result.push({
          angle: (i / layer.count) * Math.PI * 2 + li * 0.4,
          scale: layer.scale,
          tiltMax: layer.tiltMax,
          yOffset: layer.yOffset,
          layerIdx: li,
        });
      }
    });
    return result;
  }, []);

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
        const lp = Math.max(0, Math.min(1, (stemGrow - 0.2) * 2));
        leaf.scale.setScalar(lp);
        (leaf as THREE.Mesh).visible = lp > 0.01;
      });
    }

    if (centerRef.current) {
      const cp = Math.max(0, Math.min(1, (bloom - 0.3) * 2));
      centerRef.current.scale.setScalar(cp);
      centerRef.current.visible = cp > 0.01;
      centerRef.current.position.y = 1.55;
    }

    if (petalGroupRef.current) {
      petalGroupRef.current.visible = bloom > 0.01;
      petalGroupRef.current.children.forEach((petal, i) => {
        const config = petalLayers[i];
        if (!config) return;
        const pp = Math.max(0, Math.min(1, (bloom - config.layerIdx * 0.1) * 1.5));
        petal.scale.setScalar(pp * config.scale * 0.4);
        const tilt = config.tiltMax * pp;
        petal.rotation.set(-tilt, config.angle, 0);
        const r = 0.08 * pp * (1 + config.layerIdx * 0.3);
        petal.position.set(
          Math.cos(config.angle) * r,
          1.5 + config.yOffset * pp,
          Math.sin(config.angle) * r
        );
      });
    }

    const time = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(time * 0.6) * 0.015;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={stemRef} geometry={stemGeometry} material={stemMaterial} />
      <group ref={leafGroupRef}>
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.3, 0.05, 0.2]} rotation={[-Math.PI * 0.48, 0, 0.1]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[-0.25, 0.05, -0.15]} rotation={[-Math.PI * 0.48, Math.PI, -0.1]} scale={0} />
      </group>
      <mesh ref={centerRef} geometry={centerGeometry} material={centerMaterial} scale={0} />
      <group ref={petalGroupRef}>
        {petalLayers.map((_, i) => (
          <mesh key={i} geometry={petalGeometry} material={petalMaterial} scale={0} />
        ))}
      </group>
    </group>
  );
});

Lotus.displayName = 'Lotus';
export default Lotus;
