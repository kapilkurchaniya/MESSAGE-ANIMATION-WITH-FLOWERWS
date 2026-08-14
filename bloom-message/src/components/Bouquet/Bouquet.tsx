'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import FlowerFactory, { FlowerRef } from '@/components/Flowers/FlowerFactory';
import { useFlowers } from '@/hooks/useFlowers';
import { useStore } from '@/store/useStore';

export default function Bouquet() {
  const flowers = useFlowers();
  const phase = useStore((s) => s.phase);
  const groupRef = useRef<THREE.Group>(null!);
  const flowerRefs = useRef<(FlowerRef | null)[]>([]);
  const seedRef = useRef<THREE.Mesh>(null!);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Seed geometry
  const seedGeometry = useMemo(() => new THREE.SphereGeometry(0.08, 16, 16), []);
  const seedMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8B4513',
    roughness: 0.6,
    emissive: '#ff8c00',
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0,
  }), []);

  // Animation controller
  useEffect(() => {
    if (phase === 'seed') {
      // Kill any existing timeline
      if (timelineRef.current) timelineRef.current.kill();

      const tl = gsap.timeline();
      timelineRef.current = tl;

      const setPhase = useStore.getState().setPhase;

      // Scene 4: Seed appears
      tl.to(seedMaterial, {
        opacity: 1,
        emissiveIntensity: 0.8,
        duration: 1,
        ease: 'power2.out',
      })
      .to(seedRef.current?.scale || { x: 1, y: 1, z: 1 }, {
        x: 1.3, y: 1.3, z: 1.3,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
        yoyo: true,
        repeat: 2,
      }, '<0.3')
      .call(() => setPhase('stem'), [], '+=0.5');

      // Scene 5: Stem growth
      const stemDuration = 2;
      flowers.forEach((flower, i) => {
        const ref = flowerRefs.current[i];
        if (!ref) return;

        const progress = { value: 0 };
        tl.to(progress, {
          value: 1,
          duration: stemDuration,
          ease: 'power2.out',
          onUpdate: () => ref.setStemGrow(progress.value),
        }, `-=${stemDuration - i * 0.2}`);
      });

      tl.call(() => setPhase('bloom'), [], '+=0.3');

      // Scene 6: Flower bloom
      flowers.forEach((flower, i) => {
        const ref = flowerRefs.current[i];
        if (!ref) return;

        const progress = { value: 0 };
        tl.to(progress, {
          value: 1,
          duration: 2.5,
          delay: flower.bloomDelay * 0.3,
          ease: 'power2.inOut',
          onUpdate: () => ref.setBloom(progress.value),
        }, i === 0 ? '+=0' : '<0.3');
      });

      // Hide seed after blooming
      tl.to(seedMaterial, {
        opacity: 0,
        emissiveIntensity: 0,
        duration: 1,
      }, '-=2');

      tl.call(() => setPhase('bouquet'), [], '+=0.5');

      // Scene 7: Bouquet assembly (flowers drift to tighter formation)
      flowers.forEach((flower, i) => {
        const ref = flowerRefs.current[i];
        if (!ref?.group) return;

        tl.to(ref.group.position, {
          x: flower.position[0] * 0.7,
          z: flower.position[2] * 0.7,
          duration: 1.5,
          ease: 'power2.inOut',
        }, i === 0 ? '+=0' : '<0.15');
      });

      tl.call(() => setPhase('ribbon'), [], '+=0.5');
    }
  }, [phase, flowers, seedMaterial]);

  // Idle breathing
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (phase === 'idle') {
      const time = Date.now() * 0.001;
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Seed */}
      <mesh
        ref={seedRef}
        geometry={seedGeometry}
        material={seedMaterial}
        position={[0, 0.1, 0]}
      />

      {/* Flowers */}
      {flowers.map((flower, i) => (
        <FlowerFactory
          key={`${flower.type}-${i}`}
          ref={(el) => { flowerRefs.current[i] = el; }}
          type={flower.type}
          color={flower.color}
          scale={flower.scale}
          position={flower.position}
          rotation={flower.rotation}
        />
      ))}
    </group>
  );
}
