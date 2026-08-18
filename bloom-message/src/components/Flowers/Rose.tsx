'use client';

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface FlowerRef {
  /** Group containing the entire flower */
  group: THREE.Group;
  /** Set bloom progress 0..1 */
  setBloom: (t: number) => void;
  /** Set stem grow progress 0..1 */
  setStemGrow: (t: number) => void;
}

interface RoseProps {
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const Rose = forwardRef<FlowerRef, RoseProps>(({
  color = '#e84393',
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

  // Rose petal geometry (curved lathe)
  const petalGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = Math.sin(t * Math.PI) * 0.3 * (1 + t * 0.5);
      const y = t * 0.6 - 0.1;
      points.push(new THREE.Vector2(x, y));
    }
    return new THREE.LatheGeometry(points, 8, 0, Math.PI * 0.8);
  }, []);

  // Stem curve
  const stemGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, 0.5, 0.02),
      new THREE.Vector3(-0.03, 1.0, -0.01),
      new THREE.Vector3(0.02, 1.5, 0.03),
      new THREE.Vector3(0, 2.0, 0),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
  }, []);

  // Leaf geometry
  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.15, 0.1, 0.2, 0.3, 0, 0.5);
    shape.bezierCurveTo(-0.2, 0.3, -0.15, 0.1, 0, 0);
    const geom = new THREE.ShapeGeometry(shape, 8);
    return geom;
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

  const stemMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2d5016',
      roughness: 0.7,
      metalness: 0.1,
    });
  }, []);

  const leafMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#3a7d28',
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
  }, []);

  // Generate petal configurations (layered spiral)
  const petalConfigs = useMemo(() => {
    const configs = [];
    const layers = [
      { count: 5, radius: 0.1, height: 0, scale: 0.6, tiltMax: 0.3 },
      { count: 7, radius: 0.15, height: 0.05, scale: 0.75, tiltMax: 0.5 },
      { count: 8, radius: 0.22, height: 0.08, scale: 0.85, tiltMax: 0.7 },
      { count: 10, radius: 0.3, height: 0.1, scale: 1.0, tiltMax: 1.0 },
    ];

    for (const layer of layers) {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + (layer.radius * 5);
        configs.push({
          angle,
          radius: layer.radius,
          height: layer.height,
          scale: layer.scale,
          tiltMax: layer.tiltMax,
        });
      }
    }
    return configs;
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const bloom = bloomProgress.current;
    const stemGrow = stemProgress.current;

    // Stem grow animation
    if (stemRef.current) {
      stemRef.current.scale.y = stemGrow;
      stemRef.current.visible = stemGrow > 0.01;
    }

    // Leaves
    if (leafGroupRef.current) {
      leafGroupRef.current.children.forEach((leaf, i) => {
        const leafProgress = Math.max(0, Math.min(1, (stemGrow - 0.3 - i * 0.15) * 3));
        leaf.scale.setScalar(leafProgress * 0.8);
        (leaf as THREE.Mesh).visible = leafProgress > 0.01;
      });
    }

    // Petal bloom animation
    if (petalGroupRef.current) {
      petalGroupRef.current.visible = bloom > 0.01;
      petalGroupRef.current.children.forEach((petal, i) => {
        const config = petalConfigs[i];
        if (!config) return;

        const petalProgress = Math.max(0, Math.min(1, (bloom - i * 0.02) * 1.5));

        // Scale petals in
        petal.scale.setScalar(petalProgress * config.scale * 0.5);

        // Open petals outward
        const tilt = config.tiltMax * petalProgress * 0.8;
        petal.rotation.x = -tilt;

        // Position on radius
        const r = config.radius * petalProgress;
        petal.position.x = Math.cos(config.angle) * r;
        petal.position.z = Math.sin(config.angle) * r;
        petal.position.y = 2.0 + config.height * petalProgress;
        petal.rotation.y = config.angle;
      });
    }

    // Idle sway
    const time = Date.now() * 0.001;
    groupRef.current.rotation.z = Math.sin(time + position[0] * 3) * 0.03;
    groupRef.current.rotation.x = Math.cos(time * 0.7 + position[2] * 2) * 0.02;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Stem */}
      <mesh ref={stemRef} geometry={stemGeometry} material={stemMaterial} />

      {/* Leaves */}
      <group ref={leafGroupRef}>
        <mesh
          geometry={leafGeometry}
          material={leafMaterial}
          position={[0.15, 0.6, 0]}
          rotation={[0, 0, -0.4]}
          scale={0}
        />
        <mesh
          geometry={leafGeometry}
          material={leafMaterial}
          position={[-0.12, 1.0, 0.05]}
          rotation={[0.1, Math.PI, 0.3]}
          scale={0}
        />
        <mesh
          geometry={leafGeometry}
          material={leafMaterial}
          position={[0.1, 1.4, -0.05]}
          rotation={[-0.1, 0.5, -0.2]}
          scale={0}
        />
      </group>

      {/* Petals */}
      <group ref={petalGroupRef}>
        {petalConfigs.map((config, i) => (
          <mesh
            key={i}
            geometry={petalGeometry}
            material={petalMaterial}
            scale={0}
          />
        ))}
      </group>
    </group>
  );
});

Rose.displayName = 'Rose';
export default Rose;
