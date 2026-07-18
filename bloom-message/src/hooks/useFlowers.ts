'use client';

import { useMemo } from 'react';
import { useStore, FlowerConfig, FlowerType, Theme } from '@/store/useStore';

const THEME_FLOWERS: Record<Theme, FlowerType[]> = {
  romantic: ['rose', 'rose', 'tulip', 'lily', 'rose'],
  birthday: ['sunflower', 'daisy', 'tulip', 'rose', 'orchid'],
  anniversary: ['rose', 'lily', 'orchid', 'lotus', 'tulip'],
  congratulations: ['sunflower', 'daisy', 'tulip', 'rose', 'lavender'],
  friendship: ['daisy', 'lavender', 'sunflower', 'tulip', 'lotus'],
};

const THEME_COLORS: Record<Theme, string[]> = {
  romantic: ['#9d1b3f', '#d63862', '#f36f91', '#f6b1bd', '#fff0f2'],
  birthday: ['#fdcb6e', '#e17055', '#00cec9', '#6c5ce7', '#ff6b6b'],
  anniversary: ['#d63031', '#c0392b', '#e74c3c', '#ff6b6b', '#fab1a0'],
  congratulations: ['#f1c40f', '#e67e22', '#fdcb6e', '#ff6348', '#ffa502'],
  friendship: ['#a29bfe', '#81ecec', '#55efc4', '#74b9ff', '#dfe6e9'],
};

function goldenAnglePosition(index: number, total: number, radius: number): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const angle = index * goldenAngle;
  const r = radius * Math.sqrt(index / total);
  return [
    Math.cos(angle) * r,
    0,
    Math.sin(angle) * r,
  ];
}

export function useFlowers(): FlowerConfig[] {
  const theme = useStore((s) => s.theme);

  const flowers = useMemo<FlowerConfig[]>(() => {
    const types = THEME_FLOWERS[theme];
    const colors = THEME_COLORS[theme];
    const count = 15;

    return Array.from({ length: count }, (_, i) => {
      // Keep every stem inside the mouth of the bouquet.  Heights vary instead
      // of spreading the flowers too far sideways, which creates a fuller dome.
      // A compact cluster keeps every stem within the paper sleeve.  Fullness
      // comes from layered bloom heights, not a wide spread of loose stems.
      const position = goldenAnglePosition(i, count, 0.32);
      const angle = Math.atan2(position[2], position[0]);
      const jitter = (Math.random() - 0.5) * 0.06;
      const height = i === 0 ? 0.08 : (i % 4) * 0.025;

      // Angle stems in toward the bouquet centre, making a rounded dome
      // instead of the "flowers in a pot" look from upright parallel stems.
      const leanX = -position[2] * 0.32;
      const leanZ = position[0] * 0.32;

      return {
        type: types[i % types.length],
        position: [
          position[0] + jitter,
          height,
          position[2] + jitter,
        ] as [number, number, number],
        rotation: [
          leanX,
          angle + Math.PI,
          leanZ,
        ] as [number, number, number],
        color: colors[i % colors.length],
        scale: 0.64 + Math.random() * 0.13,
        bloomDelay: i * 0.4,
      };
    });
  }, [theme]);

  return flowers;
}
