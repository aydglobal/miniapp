import { motion } from 'framer-motion';
import liongiftImg from '../assets/liongift.jpg';

export default function RewardToast({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="game-reward-toast"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 20,
        background: 'linear-gradient(180deg, rgba(20,28,49,0.96), rgba(8,12,24,0.98))',
        border: '1px solid rgba(246,196,83,0.24)',
        boxShadow: '0 0 30px rgba(246,196,83,0.18), 0 12px 40px rgba(0,0,0,0.32)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          overflow: 'hidden',
          flexShrink: 0,
          border: '1px solid rgba(246,196,83,0.3)',
          boxShadow: '0 0 18px rgba(246,196,83,0.25)',
        }}
      >
        <img
          src={liongiftImg}
          alt="Reward"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </motion.div>
      <div>
        <div className="game-reward-toast__title" style={{ fontWeight: 800, fontSize: 14, color: '#f6c453' }}>{title}</div>
        <div className="game-reward-toast__body" style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{body}</div>
      </div>
    </motion.div>
  );
}
