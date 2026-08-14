'use client';

import { useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { useStore } from '@/store/useStore';

// We define the sounds as placeholders. The user will need to add these files to the public/sounds/ folder.
// Or replace these URLs with direct CDN links if they prefer.
const SOUND_ASSETS = {
  ambient: '/sounds/ambient.mp3', // Gentle background music or wind
  whoosh: '/sounds/whoosh.mp3',   // For the flower spiral/burst
  chime: '/sounds/chime.mp3',     // For the massive flash
  magic: '/sounds/magic.mp3',     // For the text reveal
};

export default function AudioController() {
  const phase = useStore((s) => s.phase);
  
  // Refs to hold our Howl instances so we can control them
  const sounds = useRef<{
    ambient?: Howl;
    whoosh?: Howl;
    chime?: Howl;
    magic?: Howl;
  }>({});

  useEffect(() => {
    // Initialize sounds
    // We set a global volume, but you can adjust individual volumes.
    Howler.volume(0.8);

    sounds.current.ambient = new Howl({
      src: [SOUND_ASSETS.ambient],
      loop: true,
      volume: 0.3,
      html5: true, // Good for large background files
    });

    sounds.current.whoosh = new Howl({
      src: [SOUND_ASSETS.whoosh],
      volume: 0.6,
    });

    sounds.current.chime = new Howl({
      src: [SOUND_ASSETS.chime],
      volume: 0.7,
    });

    sounds.current.magic = new Howl({
      src: [SOUND_ASSETS.magic],
      volume: 0.5,
    });

    // Clean up sounds on unmount
    return () => {
      Object.values(sounds.current).forEach(sound => {
        if (sound) sound.unload();
      });
    };
  }, []);

  useEffect(() => {
    // Phase-based audio logic
    if (phase === 'input') {
      // Start ambient music softly when user is on the input screen
      if (sounds.current.ambient && !sounds.current.ambient.playing()) {
        sounds.current.ambient.play();
        sounds.current.ambient.fade(0, 0.3, 2000); // Fade in over 2s
      }
    }

    if (phase === 'camera') {
      // The moment they click submit, play the whoosh for the flower spiral
      if (sounds.current.whoosh) {
        sounds.current.whoosh.play();
      }
    }
    
    // We will trigger the 'chime' and 'magic' sounds directly from the GSAP timeline 
    // or MessageStage for perfect synchronization! We expose a global window object 
    // for this so GSAP can trigger sounds easily.

  }, [phase]);

  // Expose sound triggers globally so we can trigger them from anywhere (like GSAP timelines)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerSound = (soundName: keyof typeof SOUND_ASSETS) => {
        if (sounds.current[soundName]) {
          sounds.current[soundName]?.play();
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).triggerSound;
      }
    }
  }, []);

  return null; // This component doesn't render any UI
}
