'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function ReplayButton() {
  const phase = useStore((s) => s.phase);
  const reset = useStore((s) => s.reset);
  const isMuted = useStore((s) => s.isMuted);
  const toggleMute = useStore((s) => s.toggleMute);

  if (phase !== 'idle') return null;

  const handleReplay = () => {
    reset();
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({
        title: 'Bloom Message 🌸',
        text: 'I created a personalized animated message for you!',
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 gap-3"
      >
        {/* Replay */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReplay}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-xl transition-all hover:bg-white/20"
        >
          <span>🔄</span>
          Replay
        </motion.button>

        {/* Share */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl"
        >
          <span>✨</span>
          Share
        </motion.button>

        {/* Mute toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMute}
          className="flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-xl transition-all hover:bg-white/20"
        >
          {isMuted ? '🔇' : '🔊'}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
