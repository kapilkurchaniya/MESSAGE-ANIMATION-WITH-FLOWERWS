'use client';

import { motion } from 'framer-motion';
import { useStore, Theme } from '@/store/useStore';

const THEMES: { id: Theme; label: string; icon: string; colors: string[] }[] = [
  { id: 'romantic', label: 'Romantic', icon: '💕', colors: ['#e84393', '#fd79a8'] },
  { id: 'birthday', label: 'Birthday', icon: '🎂', colors: ['#fdcb6e', '#e17055'] },
  { id: 'anniversary', label: 'Anniversary', icon: '💍', colors: ['#d63031', '#c0392b'] },
  { id: 'congratulations', label: 'Congrats', icon: '🎉', colors: ['#f1c40f', '#e67e22'] },
  { id: 'friendship', label: 'Friendship', icon: '🦋', colors: ['#a29bfe', '#81ecec'] },
];

export default function MessageInput() {
  const message = useStore((s) => s.message);
  const setMessage = useStore((s) => s.setMessage);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const setPhase = useStore((s) => s.setPhase);
  const phase = useStore((s) => s.phase);

  const handleStart = () => {
    if (message.trim().length < 1) return;
    setPhase('loading');
  };

  if (phase !== 'landing' && phase !== 'input') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bloom-form-shell fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="bloom-form-frame relative w-full max-w-md"
      >
        {/* Glass card */}
        <div className="bloom-form-card relative overflow-hidden rounded-3xl p-8">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 blur-xl" />

          <div className="bloom-form-content relative z-10">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bloom-form-title mb-2 text-center text-4xl"
            >
              🌸 Bloom Message
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bloom-form-subtitle mb-7 text-center text-sm"
            >
              Turn your words into a beautiful animated moment
            </motion.p>

            {/* Message Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <label className="bloom-form-label mb-2 block text-sm font-medium">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                placeholder="Happy Birthday Sarah ❤️"
                maxLength={100}
                rows={3}
                className="bloom-message-field w-full resize-none rounded-xl px-4 py-3 outline-none"
              />
              <div className="bloom-counter mt-1 text-right text-xs">
                {message.length}/100
              </div>
            </motion.div>

            {/* Theme Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-4"
            >
              <label className="bloom-form-label mb-3 block text-sm font-medium">
                Choose Theme
              </label>
              <div className="bloom-theme-grid grid grid-cols-5 gap-2">
                {THEMES.map((t) => (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(t.id)}
                    className={`bloom-theme-button flex flex-col items-center gap-1 rounded-xl p-2 ${
                      theme === t.id
                        ? 'bloom-theme-button-active'
                        : ''
                    }`}
                  >
                    <span className="bloom-theme-icon text-xl">{t.icon}</span>
                    <span className="bloom-theme-label text-[10px]">{t.label}</span>
                    {theme === t.id && (
                      <motion.div
                        layoutId="theme-indicator"
                        className="h-1 w-4 rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${t.colors[0]}, ${t.colors[1]})`,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Create Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={message.trim().length < 1}
              className="bloom-create-button mt-6 w-full rounded-xl py-3.5 text-sm font-semibold"
            >
              <span className="flex items-center justify-center gap-2">
                ✦ Reveal My Message
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
