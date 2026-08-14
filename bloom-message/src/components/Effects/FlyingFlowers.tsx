'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import FlowerFactory, { FlowerRef } from '../Flowers/FlowerFactory';
import { FlowerType } from '@/store/useStore';

const FLOWER_TYPES: FlowerType[] = ['rose', 'tulip', 'lily', 'sunflower', 'orchid', 'daisy', 'lotus', 'lavender'];

export default function FlyingFlowers() {
  const phase = useStore((s) => s.phase);
  const theme = useStore((s) => s.theme);
  const groupRef = useRef<THREE.Group>(null!);
  
  // Array of refs to control bloom progress
  const flowerRefs = useRef<(FlowerRef | null)[]>([]);

  const count = 25;

  const THEME_COLORS: Record<string, string[]> = {
    romantic: ['#ffb6c1', '#e84393', '#ff6b81', '#f8c8dc', '#ffffff'],
    birthday: ['#ffd700', '#f39c12', '#e74c3c', '#ffffff', '#3498db'],
    anniversary: ['#ff6b6b', '#e84393', '#ffffff', '#ff9ff3', '#feca57'],
    congratulations: ['#ff8c00', '#f1c40f', '#2ecc71', '#3498db', '#ffffff'],
    friendship: ['#dda0dd', '#9b59b6', '#f368e0', '#48dbfb', '#ffffff'],
  };

  const flowers = useMemo(() => {
    const colors = THEME_COLORS[theme] || THEME_COLORS.romantic;
    return Array.from({ length: count }, (_, i) => {
      const type = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      return {
        id: i,
        type,
        color,
        scale: 0.3 + Math.random() * 0.2, // Keep them relatively small
        x: (Math.random() - 0.5) * 40, // Spread wide horizontally
        y: (Math.random() - 0.5) * 15 + 2, // Spread vertically
        z: -10 - Math.random() * 15, // Far in the background
        speedX: (1.5 + Math.random() * 2.5) * direction, // Move fast enough to notice
        speedY: (Math.random() - 0.5) * 0.5,
        rotSpeedX: (Math.random() - 0.5) * 1.5,
        rotSpeedY: (Math.random() - 0.5) * 1.5,
        rotSpeedZ: (Math.random() - 0.5) * 1.5,
        phase: Math.random() * Math.PI * 2,
        direction,
      };
    });
  }, [theme]);

  // Set bloom to 1 for all background flowers
  useEffect(() => {
    flowerRefs.current.forEach(ref => {
      if (ref) {
        ref.setBloom(1);
        ref.setStemGrow(1);
      }
    });
  }, [flowers]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Only show during message phase (or camera transition) to avoid cluttering the intro
    const shouldShow = ['message', 'idle', 'camera'].includes(phase);
    groupRef.current.visible = shouldShow;
    
    if (!shouldShow) return;

    const time = Date.now() * 0.001;

    groupRef.current.children.forEach((mesh, i) => {
      const config = flowers[i];
      if (!config) return;

      // Update position
      config.x += config.speedX * delta;
      config.y += config.speedY * delta + Math.sin(time * 2 + config.phase) * 0.01;
      
      // Wrap around logic
      if (config.direction === 1 && config.x > 25) {
        config.x = -25;
        config.y = (Math.random() - 0.5) * 15 + 2;
      } else if (config.direction === -1 && config.x < -25) {
        config.x = 25;
        config.y = (Math.random() - 0.5) * 15 + 2;
      }

      mesh.position.set(config.x, config.y, config.z);
      
      // Update rotation
      mesh.rotation.x += config.rotSpeedX * delta;
      mesh.rotation.y += config.rotSpeedY * delta;
      mesh.rotation.z += config.rotSpeedZ * delta;
    });
  });

  return (
    <group ref={groupRef}>
      {flowers.map((config, i) => (
        <group key={config.id}>
          <FlowerFactory
            ref={(el) => { flowerRefs.current[i] = el; }}
            type={config.type}
            color={config.color}
            scale={config.scale}
          />
        </group>
      ))}
    </group>
  );
}
