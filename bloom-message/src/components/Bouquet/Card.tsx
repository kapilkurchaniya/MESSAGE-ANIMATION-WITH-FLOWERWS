'use client';

import { Html } from '@react-three/drei';
import { useStore } from '@/store/useStore';

export default function Card() {
  const message = useStore((s) => s.message);
  const phase = useStore((s) => s.phase);

  const visible = ['idle'].includes(phase);

  if (!visible || !message) return null;

  return (
    <group position={[0.5, 1.2, 0.5]} rotation={[0, -0.5, 0.1]}>
      {/* Card backing */}
      <mesh>
        <planeGeometry args={[0.6, 0.4]} />
        <meshPhysicalMaterial
          color="#fffef0"
          roughness={0.9}
          metalness={0}
          side={2}
        />
      </mesh>
      <Html
        transform
        occlude
        position={[0, 0, 0.005]}
        style={{
          width: '120px',
          fontSize: '8px',
          fontFamily: '"Bodoni 72", Didot, Georgia, serif',
          color: '#4a4a4a',
          textAlign: 'center',
          lineHeight: '1.4',
          letterSpacing: '0.02em',
          fontStyle: 'italic',
          textShadow: '0 1px 0 rgba(255,255,255,.8)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div>{message.slice(0, 60)}</div>
      </Html>
    </group>
  );
}
