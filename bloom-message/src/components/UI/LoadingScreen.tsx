'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const FLOWER_ICONS = ['🌹', '🌷', '🌸', '🌻', '🌺', '🌼', '🪷', '💜'];

export default function LoadingScreen() {
  const phase = useStore((s) => s.phase);
  const setPhase = useStore((s) => s.setPhase);
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);

  useEffect(() => {
    if (phase !== 'loading') return;

    // Simulate loading
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          // Go directly to the personalized animated message.
          setTimeout(() => setPhase('message'), 300);
          return 100;
        }
        return p + 2;
      });
    }, 40);

    // Rotate flower icons
    const iconInterval = setInterval(() => {
      setCurrentIcon((c) => (c + 1) % FLOWER_ICONS.length);
    }, 300);

    return () => {
      clearInterval(interval);
      clearInterval(iconInterval);
    };
  }, [phase, setPhase]);

  if (phase !== 'loading') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a1a] to-[#1a0a2e]"
      >
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/30"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Rotating flower icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mb-8 text-6xl"
        >
          {FLOWER_ICONS[currentIcon]}
        </motion.div>

        {/* Progress text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-sm text-white/60"
        >
          Preparing your personal message...
        </motion.p>

        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-white/40"
        >
          {progress}%
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
