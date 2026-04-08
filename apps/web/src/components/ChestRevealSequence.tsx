import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

type Props = {
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  jackpot?: boolean;
  rewards: { adn: number; shards: number; boostMinutes: number };
  onDone: () => void;
};

const RARITY_GRADIENT: Record<Props['rarity'], string> = {
  mythic: 'game-chest-reveal--mythic',
  legendary: 'game-chest-reveal--legendary',
  epic: 'game-chest-reveal--epic',
  rare: 'game-chest-reveal--rare',
  common: 'game-chest-reveal--common'
};

const RARITY_GLOW: Record<Props['rarity'], string> = {
  mythic: 'rgba(255,0,255,0.5)',
  legendary: 'rgba(255,165,0,0.5)',
  epic: 'rgba(139,92,246,0.5)',
  rare: 'rgba(56,189,248,0.5)',
  common: 'rgba(255,255,255,0.2)'
};

const RARITY_EMOJI: Record<Props['rarity'], string> = {
  mythic: '🌟',
  legendary: '🏆',
  epic: '💎',
  rare: '✨',
  common: '📦'
};

export default function ChestRevealSequence({ rarity, jackpot, rewards, onDone }: Props) {
  const [phase, setPhase] = useState<'open' | 'reveal'>('open');

  useEffect(() => {
    const t = setTimeout(() => setPhase('reveal'), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="game-chest-reveal-overlay">
      {/* Arka plan glow burst */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.6, 0], scale: [0.5, 2.5, 3] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at center, ${RARITY_GLOW[rarity]}, transparent 60%)`,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={`game-chest-reveal-card ${RARITY_GRADIENT[rarity]}`}
        style={{
          position: 'relative',
          zIndex: 1,
          boxShadow: `0 0 60px ${RARITY_GLOW[rarity]}, 0 0 120px ${RARITY_GLOW[rarity].replace('0.5', '0.2')}`
        }}
      >
        {/* Chest emoji animasyonu */}
        <motion.div
          animate={phase === 'open'
            ? { scale: [1, 1.3, 0.9, 1.1, 1], rotate: [0, -8, 8, -4, 0] }
            : { scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: 64, textAlign: 'center', marginBottom: 8 }}
        >
          {RARITY_EMOJI[rarity]}
        </motion.div>

        <div className="game-eyebrow">Cache Reveal</div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="game-chest-reveal-rarity"
        >
          {rarity.toUpperCase()}
        </motion.div>

        {jackpot && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="game-chest-reveal-jackpot"
          >
            🎰 BÜYÜK VURUŞ
          </motion.div>
        )}

        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="game-chest-reveal-rewards"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
              >
                💰 ADN +{rewards.adn}
              </motion.div>
              {rewards.shards > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.25 }}
                >
                  🔷 Shard +{rewards.shards}
                </motion.div>
              )}
              {rewards.boostMinutes > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.35 }}
                >
                  ⚡ Boost +{rewards.boostMinutes}dk
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="game-button game-button--full"
          onClick={onDone}
        >
          Devam
        </motion.button>
      </motion.div>
    </div>
  );
}
