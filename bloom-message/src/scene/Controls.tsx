'use client';

import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { useStore } from '@/store/useStore';

export default function Controls() {
  const phase = useStore((s) => s.phase);

  // Only enable user controls during idle phase
  const enabled = phase === 'idle';

  return (
    <DreiOrbitControls
      enabled={enabled}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={15}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.6}
      target={[0, 2, 0]}
      enablePan={false}
      rotateSpeed={0.5}
      // Touch support
      touches={{
        ONE: 1, // ROTATE
        TWO: 2, // DOLLY_PAN (pinch zoom)
      }}
    />
  );
}
