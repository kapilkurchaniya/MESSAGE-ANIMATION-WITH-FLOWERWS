'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';

/**
 * Hook that manages the master GSAP timeline lifecycle.
 * Sub-timelines are created by individual components (Bouquet, Ribbon, etc.)
 * and the phase controller in Experience handles transitions.
 */
export function useTimeline() {
  const phase = useStore((s) => s.phase);
  const setProgress = useStore((s) => s.setProgress);
  const masterRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Create a master timeline if it doesn't exist
    if (!masterRef.current) {
      masterRef.current = gsap.timeline({
        paused: true,
        onUpdate: () => {
          if (masterRef.current) {
            setProgress(masterRef.current.progress());
          }
        },
      });
    }

    return () => {
      masterRef.current?.kill();
      masterRef.current = null;
    };
  }, [setProgress]);

  return masterRef;
}
