'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';

export default function MessageReveal() {
  const message = useStore((s) => s.message);
  const phase = useStore((s) => s.phase);
  const theme = useStore((s) => s.theme);
  const groupRef = useRef<THREE.Group>(null!);
  const letterRefs = useRef<THREE.Group[]>([]);

  const THEME_TEXT_COLORS: Record<string, string> = {
    romantic: '#ff69b4',
    birthday: '#ffd700',
    anniversary: '#ff4444',
    congratulations: '#ff8c00',
    friendship: '#9370db',
  };

  const textColor = THEME_TEXT_COLORS[theme] || '#ff69b4';
  const letters = useMemo(() => message.split(''), [message]);

  // Calculate letter positions (center-aligned)
  const letterPositions = useMemo(() => {
    const charWidth = 0.18;
    const lineHeight = 0.34;
    const maxCharsPerLine = 24;

    const lines: string[][] = [];
    let currentLine: string[] = [];

    letters.forEach((letter) => {
      if (currentLine.length >= maxCharsPerLine && letter === ' ') {
        lines.push(currentLine);
        currentLine = [];
      } else {
        currentLine.push(letter);
      }
    });
    if (currentLine.length > 0) lines.push(currentLine);

    const positions: [number, number, number][] = [];
    let letterIndex = 0;

    lines.forEach((line, lineIdx) => {
      const lineWidth = line.length * charWidth;
      const startX = -lineWidth / 2;
      const y = -lineIdx * lineHeight + ((lines.length - 1) * lineHeight) / 2;

      line.forEach((_, charIdx) => {
        positions.push([startX + charIdx * charWidth, y, 0]);
        letterIndex++;
      });
    });

    return positions;
  }, [letters]);

  useEffect(() => {
    if (phase === 'message' && letterRefs.current.length > 0) {
      const tl = gsap.timeline();

      // Each letter springs in
      letterRefs.current.forEach((letterGroup, i) => {
        if (!letterGroup) return;

        // Start hidden
        letterGroup.scale.set(0, 0, 0);
        letterGroup.rotation.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        letterGroup.position.y += 0.3;

        tl.to(letterGroup.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.4,
          ease: 'back.out(2)',
        }, i * 0.06)
        .to(letterGroup.rotation, {
          x: 0, y: 0, z: 0,
          duration: 0.3,
          ease: 'power2.out',
        }, i * 0.06)
        .to(letterGroup.position, {
          y: letterPositions[i]?.[1] ?? 0,
          duration: 0.3,
          ease: 'bounce.out',
        }, i * 0.06);
      });

      // After all letters reveal, transition to idle
      tl.call(() => {
        useStore.getState().setPhase('idle');
      }, [], '+=2');
    }
  }, [phase, letterPositions]);

  // Gentle floating in idle
  useFrame(() => {
    if (!groupRef.current) return;

    if (phase === 'idle') {
      const time = Date.now() * 0.001;
      groupRef.current.position.y = 3.75 + Math.sin(time * 0.5) * 0.1;
    }
  });

  const visible = ['message', 'idle'].includes(phase);

  return (
    <group ref={groupRef} position={[0, 3.75, 0]} visible={visible}>
      {letters.map((letter, i) => (
        <group
          key={i}
          ref={(el) => { if (el) letterRefs.current[i] = el; }}
          position={letterPositions[i] || [0, 0, 0]}
        >
          <Text
            fontSize={0.22}
            color={textColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.008}
            outlineColor="#fff5fb"
          >
            {letter}
            <meshPhysicalMaterial
              color={textColor}
              roughness={0.3}
              metalness={0.2}
              emissive={textColor}
              emissiveIntensity={0.3}
              transparent
              toneMapped={false}
            />
          </Text>
        </group>
      ))}
    </group>
  );
}
