'use client';

import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

const THEME_ACCENTS: Record<string, { primary: string; glow: string; flower: string }> = {
  romantic: { primary: '#ff9ac6', glow: '#e7519c', flower: '✿' },
  birthday: { primary: '#ffd36a', glow: '#f18b43', flower: '✦' },
  anniversary: { primary: '#ff8993', glow: '#cf3450', flower: '❦' },
  congratulations: { primary: '#ffd36a', glow: '#ed9b21', flower: '✦' },
  friendship: { primary: '#b9a7ff', glow: '#7568df', flower: '✿' },
};

export default function MessageStage() {
  const message = useStore((s) => s.message);
  const phase = useStore((s) => s.phase);
  const theme = useStore((s) => s.theme);
  const setPhase = useStore((s) => s.setPhase);
  const visible = phase === 'message' || phase === 'idle';
  const accent = THEME_ACCENTS[theme] || THEME_ACCENTS.romantic;

  useEffect(() => {
    if (phase !== 'message') return;
    const duration = Math.min(7600, Math.max(2800, message.length * 45 + 1400));
    const timer = window.setTimeout(() => setPhase('idle'), duration);
    return () => window.clearTimeout(timer);
  }, [message.length, phase, setPhase]);

  if (!visible || !message) return null;

  return (
    <AnimatePresence>
      <motion.section className="message-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-live="polite">
        <motion.div
          className="message-stage-card"
          style={{ '--message-accent': accent.primary, '--message-glow': accent.glow } as CSSProperties}
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 4.0 }}
        >
          <div className="message-stage-ornament" aria-hidden="true">{accent.flower}</div>
          <p className="message-stage-kicker">A message made especially for you</p>
          <h1 className="message-stage-text">
            {message.split('').map((character, index) => (
              <motion.span
                key={`${character}-${index}`}
                initial={{ opacity: 0, filter: 'blur(8px)', y: 15, scale: 0.9 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 4.5 + index * 0.05, ease: [0.2, 0.65, 0.3, 0.9] }}
              >
                {character === ' ' ? '\u00a0' : character}
              </motion.span>
            ))}
          </h1>
          <div className="message-stage-flourish" aria-hidden="true"><span>{accent.flower}</span><i /><span>{accent.flower}</span></div>
        </motion.div>
      </motion.section>
    </AnimatePresence>
  );
}
