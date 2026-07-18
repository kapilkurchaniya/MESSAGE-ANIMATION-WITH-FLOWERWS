'use client';

import { create } from 'zustand';

export type Theme = 'romantic' | 'birthday' | 'anniversary' | 'congratulations' | 'friendship';

export type Phase =
  | 'landing'
  | 'input'
  | 'loading'
  | 'seed'
  | 'stem'
  | 'bloom'
  | 'bouquet'
  | 'ribbon'
  | 'particles'
  | 'camera'
  | 'message'
  | 'idle';

export type FlowerType =
  | 'rose'
  | 'tulip'
  | 'lily'
  | 'sunflower'
  | 'orchid'
  | 'daisy'
  | 'lotus'
  | 'lavender';

export type QualityLevel = 'low' | 'medium' | 'high';

export interface FlowerConfig {
  type: FlowerType;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  scale: number;
  bloomDelay: number;
}

interface BloomStore {
  // User input
  message: string;
  setMessage: (msg: string) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Animation phase
  phase: Phase;
  setPhase: (phase: Phase) => void;

  // Playback
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  // Flower configuration
  flowers: FlowerConfig[];
  setFlowers: (flowers: FlowerConfig[]) => void;

  // Quality
  quality: QualityLevel;
  setQuality: (quality: QualityLevel) => void;

  // Audio
  isMuted: boolean;
  toggleMute: () => void;

  // Master timeline progress (0-1)
  progress: number;
  setProgress: (p: number) => void;

  // Reset everything for replay
  reset: () => void;
}

const initialState = {
  message: '',
  theme: 'romantic' as Theme,
  phase: 'landing' as Phase,
  isPlaying: false,
  flowers: [] as FlowerConfig[],
  quality: 'high' as QualityLevel,
  isMuted: false,
  progress: 0,
};

export const useStore = create<BloomStore>((set) => ({
  ...initialState,

  setMessage: (message) => set({ message }),
  setTheme: (theme) => set({ theme }),
  setPhase: (phase) => set({ phase }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setFlowers: (flowers) => set({ flowers }),
  setQuality: (quality) => set({ quality }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setProgress: (progress) => set({ progress }),

  reset: () => set({ ...initialState, phase: 'landing' }),
}));
