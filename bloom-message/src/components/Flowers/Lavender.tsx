'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FlowerRef } from './Rose';

interface LavenderProps {
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Lavender = forwardRef<FlowerRef, LavenderProps>(({
  color = '#9b59b6',
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const stemRef = useRef<THREE.Mesh>(null!);
  const flowerSpikeRef = useRef<THREE.Group>(null!);
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
      new THREE.Vector3(0.02, 0.5, 0),
      new THREE.Vector3(-0.01, 1.0, 0.01),
      new THREE.Vector3(0.01, 1.5, 0),
      new THREE.Vector3(0, 1.8, -0.01),
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.02, 6, false);
  }, []);

  // Tiny bud geometry
  const budGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.035, 6, 6);
  }, []);

  // Narrow leaf
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.03, 0.1, 0.02, 0.4, 0, 0.6);
    shape.bezierCurveTo(-0.02, 0.4, -0.03, 0.1, 0, 0);
    return new THREE.ShapeGeometry(shape, 6);
  }, []);

  const budMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.3,
    metalness: 0.0,
    transmission: 0.2,
    thickness: 0.3,
    ior: 1.5,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.15,
  }), [color]);

  const stemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5a7d3a', roughness: 0.7,
  }), []);

  const leafMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6a8d4a', roughness: 0.6, side: THREE.DoubleSide,
  }), []);

  // Buds arranged in whorls along the spike
  const budConfigs = useMemo(() => {
    const configs: { y: number; angle: number; radius: number }[] = [];
    const whorls = 8;
    const budsPerWhorl = 4;
    for (let w = 0; w < whorls; w++) {
      const y = 1.8 + w * 0.08;
      const r = 0.06 * (1 - w / whorls * 0.3);
      for (let b = 0; b < budsPerWhorl; b++) {
        const angle = (b / budsPerWhorl) * Math.PI * 2 + w * 0.5;
        configs.push({ y, angle, radius: r });
      }
    }
    return configs;
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
        const lp = Math.max(0, Math.min(1, (stemGrow - 0.2 - i * 0.15) * 3));
        leaf.scale.setScalar(lp * 0.5);
        (leaf as THREE.Mesh).visible = lp > 0.01;
      });
    }

    if (flowerSpikeRef.current) {
      flowerSpikeRef.current.visible = bloom > 0.01;
      flowerSpikeRef.current.children.forEach((bud, i) => {
        const config = budConfigs[i];
        if (!config) return;
        // Bloom from bottom to top
        const normalizedY = (config.y - 1.8) / (0.08 * 8);
        const bp = Math.max(0, Math.min(1, (bloom - normalizedY * 0.5) * 3));
        bud.scale.setScalar(bp);
        bud.position.set(
          Math.cos(config.angle) * config.radius,
          config.y,
          Math.sin(config.angle) * config.radius
        );
        (bud as THREE.Mesh).visible = bp > 0.01;
      });
    }

    const time = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(time * 1.5 + position[0] * 5) * 0.05;
    groupRef.current.rotation.x = Math.cos(time * 1.1 + position[2] * 3) * 0.03;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={stemRef} geometry={stemGeometry} material={stemMaterial} />
      <group ref={leafGroupRef}>
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.05, 0.2, 0]} rotation={[0, 0, -0.3]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[-0.05, 0.5, 0]} rotation={[0, Math.PI, 0.25]} scale={0} />
        <mesh geometry={leafGeometry} material={leafMaterial}
          position={[0.04, 0.8, 0.02]} rotation={[0.1, 0.3, -0.2]} scale={0} />
      </group>
      <group ref={flowerSpikeRef}>
        {budConfigs.map((_, i) => (
          <mesh key={i} geometry={budGeometry} material={budMaterial} scale={0} />
        ))}
      </group>
    </group>
  );
});

Lavender.displayName = 'Lavender';
export default Lavender;
