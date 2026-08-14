'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';

export default function Ribbon() {
  const phase = useStore((s) => s.phase);
  const theme = useStore((s) => s.theme);
  const groupRef = useRef<THREE.Group>(null!);
  const ribbonRef = useRef<THREE.Mesh>(null!);
  const bowRef = useRef<THREE.Group>(null!);
  const wrapProgress = useRef(0);

  const RIBBON_COLORS: Record<string, string> = {
    romantic: '#ff69b4',
    birthday: '#ffd700',
    anniversary: '#c0392b',
    congratulations: '#f1c40f',
    friendship: '#9b59b6',
  };

  const ribbonColor = RIBBON_COLORS[theme] || '#ff69b4';

  // Spiral ribbon path
  const ribbonGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const spirals = 3;
    const segments = 100;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * spirals;
      const radius = 0.42 + t * 0.12;
      const y = 0.34 + t * 1.08;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 80, 0.025, 6, false);
  }, []);

  // Bow loops
  const bowLoopGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.15, 0.1, 0.05),
      new THREE.Vector3(0.25, 0, 0),
      new THREE.Vector3(0.15, -0.1, -0.05),
      new THREE.Vector3(0, 0, 0),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.02, 6, false);
  }, []);

  // Bow tail
  const bowTailGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, -0.15, 0.02),
      new THREE.Vector3(0.1, -0.3, 0),
    ]);
    return new THREE.TubeGeometry(curve, 10, 0.015, 6, false);
  }, []);

  const ribbonMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(ribbonColor),
    roughness: 0.2,
    metalness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0,
  }), [ribbonColor]);

  useEffect(() => {
    if (phase === 'ribbon') {
      const tl = gsap.timeline();

      // Fade in ribbon
      tl.to(ribbonMaterial, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      });

      // Wrap animation via draw range
      const progress = { value: 0 };
      tl.to(progress, {
        value: 1,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
          wrapProgress.current = progress.value;
          if (ribbonRef.current) {
            const geo = ribbonRef.current.geometry;
            const totalVertices = geo.attributes.position.count;
            geo.setDrawRange(0, Math.floor(totalVertices * progress.value));
          }
        },
      });

      // Bow appears
      if (bowRef.current) {
        tl.fromTo(bowRef.current.scale, {
          x: 0, y: 0, z: 0,
        }, {
          x: 1, y: 1, z: 1,
          duration: 0.8,
          ease: 'elastic.out(1, 0.4)',
        });
      }

      tl.call(() => {
        useStore.getState().setPhase('particles');
      }, [], '+=0.5');
    }
  }, [phase, ribbonMaterial]);

  // Idle sway
  useFrame(() => {
    if (!groupRef.current) return;
    const time = Date.now() * 0.001;
    if (bowRef.current && wrapProgress.current >= 1) {
      bowRef.current.rotation.z = Math.sin(time * 2) * 0.05;
    }
  });

  const visible = ['ribbon', 'particles', 'camera', 'message', 'idle'].includes(phase);

  return (
    <group ref={groupRef} visible={visible}>
      <mesh
        ref={ribbonRef}
        geometry={ribbonGeometry}
        material={ribbonMaterial}
      />
      <group ref={bowRef} position={[0.44, 0.9, 0.44]} scale={0}>
        {/* Left loop */}
        <mesh geometry={bowLoopGeometry} material={ribbonMaterial} />
        {/* Right loop (mirrored) */}
        <mesh
          geometry={bowLoopGeometry}
          material={ribbonMaterial}
          scale={[-1, 1, 1]}
        />
        {/* Tails */}
        <mesh geometry={bowTailGeometry} material={ribbonMaterial} />
        <mesh
          geometry={bowTailGeometry}
          material={ribbonMaterial}
          scale={[-1, 1, -1]}
        />
      </group>
    </group>
  );
}
