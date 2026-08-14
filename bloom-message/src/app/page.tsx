'use client';

import { useState, useEffect } from 'react';

import dynamic from 'next/dynamic';
import MessageInput from '@/components/UI/MessageInput';
import LoadingScreen from '@/components/UI/LoadingScreen';
import ReplayButton from '@/components/UI/ReplayButton';
import MessageStage from '@/components/UI/MessageStage';
import { useStore } from '@/store/useStore';

// Dynamic import for the 3D scene (client-only, no SSR)
const Experience = dynamic(() => import('@/scene/Experience'), {
  ssr: false,
});

// Animated background particles for landing
function LandingBackground() {
  const phase = useStore((s) => s.phase);
  const [particles, setParticles] = useState<{size: string, left: string, top: string, animation: string, animationDelay: string}[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }, () => ({
        size: `${2 + Math.random() * 4}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
        animationDelay: `${Math.random() * 5}s`,
      }))
    );
  }, []);

  if (phase !== 'landing' && phase !== 'input') return null;

  return (
    <div className="bg-animated fixed inset-0 z-0">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: p.top,
              animation: p.animation,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div
        className="absolute h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #ff69b4, transparent)',
          top: '10%',
          left: '10%',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #9370db, transparent)',
          bottom: '10%',
          right: '10%',
          animation: 'float 10s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />
      <div
        className="absolute h-64 w-64 rounded-full opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #4169e1, transparent)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'float 7s ease-in-out infinite',
          animationDelay: '1s',
        }}
      />
    </div>
  );
}

// Dark scene background for 3D phases
function SceneBackground() {
  const phase = useStore((s) => s.phase);
  const show = !['landing', 'input', 'loading'].includes(phase);

  return (
    <div
      className="fixed inset-0 z-0"
      style={{
        background: 'linear-gradient(to bottom, #0a0a15, #0d0520, #0a0a15)',
        opacity: show ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out',
      }}
    />
  );
}

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Backgrounds */}
      <LandingBackground />
      <SceneBackground />

      {/* 3D Scene */}
      <Experience />

      {/* UI Overlays */}
      <MessageInput />
      <LoadingScreen />
      <MessageStage />
      <ReplayButton />
    </main>
  );
}
