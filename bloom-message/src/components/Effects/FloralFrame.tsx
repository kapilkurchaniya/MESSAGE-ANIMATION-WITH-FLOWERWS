'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';
import FlowerFactory, { FlowerRef } from '../Flowers/FlowerFactory';

export default function FloralFrame() {
  const phase = useStore((s) => s.phase);
  const theme = useStore((s) => s.theme);
  
  const groupRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  
  // Outer groups for positioning
  const tlRef = useRef<THREE.Group>(null!);
  const trRef = useRef<THREE.Group>(null!);
  const blRef = useRef<THREE.Group>(null!);
  const brRef = useRef<THREE.Group>(null!);

  // Flower refs to control bloom
  const f1 = useRef<FlowerRef>(null!);
  const f2 = useRef<FlowerRef>(null!);
  const f3 = useRef<FlowerRef>(null!);
  const f4 = useRef<FlowerRef>(null!);

  const { viewport } = useThree();

  useEffect(() => {
    // Only trigger when phase is 'message'
    if (phase !== 'message') return;

    // Fully bloom the flowers instantly so they look good while flying
    [f1, f2, f3, f4].forEach(ref => {
      if (ref.current) {
        ref.current.setStemGrow(1);
        ref.current.setBloom(1);
      }
    });

    const hw = viewport.width / 2 - 2;
    const hh = viewport.height / 2 - 2;
    const zPos = 3;

    const ctx = gsap.context(() => {
      const corners = [tlRef.current, trRef.current, blRef.current, brRef.current];
      const scales = corners.map(c => c.scale);
      const positions = corners.map(c => c.position);
      
      // 1. Initial State: at center, tiny
      gsap.set(positions, { x: 0, y: 0, z: 0 });
      gsap.set(scales, { x: 0, y: 0, z: 0 });
      gsap.set(groupRef.current.rotation, { z: 0 });

      // 2. Fly to Center & Scale Up Slowly
      gsap.to(scales, {
        x: 1.6,
        y: 1.6,
        z: 1.6,
        duration: 1.2,
        ease: 'back.out(1.2)',
      });

      // 3. Spiral Outward (Create a circle of flowers)
      const radius = 2.5;
      gsap.to(tlRef.current.position, { x: -radius, y: radius, z: 1, duration: 1.5, delay: 0.8, ease: 'power2.inOut' });
      gsap.to(trRef.current.position, { x: radius, y: radius, z: 1, duration: 1.5, delay: 0.8, ease: 'power2.inOut' });
      gsap.to(blRef.current.position, { x: -radius, y: -radius, z: 1, duration: 1.5, delay: 0.8, ease: 'power2.inOut' });
      gsap.to(brRef.current.position, { x: radius, y: -radius, z: 1, duration: 1.5, delay: 0.8, ease: 'power2.inOut' });

      // Rotate the whole group to create a beautiful spiral effect
      gsap.to(groupRef.current.rotation, {
        z: Math.PI * 2, // one full rotation
        duration: 3,
        ease: 'power1.inOut'
      });

      // 4. Massive Flash
      gsap.fromTo(lightRef.current, 
        { intensity: 0 },
        {
          intensity: 25,
          distance: 30,
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          delay: 3.0,
          ease: 'power2.inOut',
        }
      );

      // Sound triggers
      gsap.delayedCall(3.0, () => {
        if (typeof window !== 'undefined' && (window as any).triggerSound) {
          (window as any).triggerSound('chime');
        }
      });
      
      gsap.delayedCall(4.2, () => {
        if (typeof window !== 'undefined' && (window as any).triggerSound) {
          (window as any).triggerSound('magic');
        }
      });

      // 5. Adjust to Corners
      gsap.to(tlRef.current.position, { x: -hw, y: hh, z: zPos, duration: 1.8, delay: 3.2, ease: 'power3.inOut' });
      gsap.to(tlRef.current.rotation, { z: -Math.PI / 4, x: Math.PI/6, duration: 1.8, delay: 3.2 });
      
      gsap.to(trRef.current.position, { x: hw, y: hh, z: zPos, duration: 1.8, delay: 3.2, ease: 'power3.inOut' });
      gsap.to(trRef.current.rotation, { z: Math.PI / 4, x: Math.PI/6, duration: 1.8, delay: 3.2 });
      
      gsap.to(blRef.current.position, { x: -hw, y: -hh, z: zPos, duration: 1.8, delay: 3.2, ease: 'power3.inOut' });
      gsap.to(blRef.current.rotation, { z: -Math.PI * 0.75, x: -Math.PI/6, duration: 1.8, delay: 3.2 });
      
      gsap.to(brRef.current.position, { x: hw, y: -hh, z: zPos, duration: 1.8, delay: 3.2, ease: 'power3.inOut' });
      gsap.to(brRef.current.rotation, { z: Math.PI * 0.75, x: -Math.PI/6, duration: 1.8, delay: 3.2 });

      // 6. Ambient Sway
      corners.forEach((corner, i) => {
        gsap.to(corner.position, {
          y: `+=${0.3 * (i%2 ? 1 : -1)}`,
          duration: 3 + i * 0.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: 5.0
        });
      });

    }, groupRef);

    return () => ctx.revert();
  }, [phase, viewport]);

  if (!['message', 'idle'].includes(phase)) return null;

  const getFlowerType = () => {
    switch(theme) {
      case 'romantic': return 'rose';
      case 'birthday': return 'sunflower';
      case 'anniversary': return 'lily';
      case 'congratulations': return 'tulip';
      case 'friendship': return 'daisy';
      default: return 'rose';
    }
  };

  const fType = getFlowerType();

  return (
    <group ref={groupRef}>
      <pointLight ref={lightRef} distance={0} decay={2} intensity={0} color="#ffffff" />
      
      <group ref={tlRef}>
        <FlowerFactory ref={f1} type={fType} scale={2} />
      </group>
      <group ref={trRef}>
        <FlowerFactory ref={f2} type={fType} scale={2} />
      </group>
      <group ref={blRef}>
        <FlowerFactory ref={f3} type={fType} scale={2} />
      </group>
      <group ref={brRef}>
        <FlowerFactory ref={f4} type={fType} scale={2} />
      </group>
    </group>
  );
}
