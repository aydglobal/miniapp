import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import liongiftImg from '../assets/liongift.jpg';

type Props = {
  level: number;
  visible: boolean;
  onDone: () => void;
};

export default function LevelUpOverlay({ level, visible, onDone }: Props) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDone, 2200);
    return () => window.clearTimeout(timer);
  }, [visible, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="levelup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="game-levelup-overlay"
          role="status"
          aria-live="assertive"
          onClick={onDone}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            display: 'grid',
            placeItems: 'center',
            background: 'radial-gradient(circle at center, rgba(246,196,83,0.18), rgba(0,0,0,0.72))',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Lion gift animasyonu */}
            <motion.div
              initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
              animate={{ scale: [0.5, 1.15, 1], rotate: [- 15, 8, 0], opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 140,
                height: 140,
                borderRadius: 32,
                overflow: 'hidden',
                boxShadow: '0 0 60px rgba(246,196,83,0.5), 0 20px 50px rgba(0,0,0,0.4)',
                border: '2px solid rgba(246,196,83,0.4)',
              }}
            >
              <motion.img
                src={liongiftImg}
                alt="Level Up"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </motion.div>

            {/* Parçacık efekti */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.5],
                  x: Math.cos((i / 8) * Math.PI * 2) * 80,
                  y: Math.sin((i / 8) * Math.PI * 2) * 80,
                }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#f6c453' : '#38bdf8',
                  boxShadow: `0 0 12px ${i % 2 === 0 ? '#f6c453' : '#38bdf8'}`,
                }}
              />
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#f6c453',
                marginBottom: 8,
              }}>
                LEVEL UP
              </div>
              <div style={{
                fontSize: 64,
                fontWeight: 900,
                lineHeight: 1,
                background: 'linear-gradient(90deg, #f6c453, #fff, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {level}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
