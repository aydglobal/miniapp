import { motion, AnimatePresence } from 'framer-motion';
import type { MissionInstance } from '../../game/missions/dailyMissionGenerator';
import { springs } from '../../motion/motionPresets';

type MissionClaimModalProps = {
  open: boolean;
  mission: MissionInstance | null;
  onClose: () => void;
  onClaim: (missionId: string) => void;
};

// Mevcut ödül satırları mantığı korundu — gems/keys/boost desteği var
function rewardLines(mission: MissionInstance | null) {
  if (!mission) return [];
  const lines: string[] = [];
  if (mission.reward.coins) lines.push(`+${mission.reward.coins} ADN`);
  if (mission.reward.gems)  lines.push(`+${mission.reward.gems} Gem`);
  if (mission.reward.keys)  lines.push(`+${mission.reward.keys} Key`);
  if (mission.reward.boost) {
    lines.push(
      `${mission.reward.boost.type.toUpperCase()} x${mission.reward.boost.multiplier} · ${mission.reward.boost.durationMinutes} dk`
    );
  }
  return lines;
}

export default function MissionClaimModal({ open, mission, onClose, onClaim }: MissionClaimModalProps) {
  const ready = Boolean(mission && mission.progress >= mission.target && !mission.claimed);

  return (
    <AnimatePresence>
      {open && mission && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] grid place-items-center bg-black/60 p-4 backdrop-blur-[8px]"
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={springs.card}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded-[28px] border border-white/10 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            style={{
              background:
                'radial-gradient(circle at top, rgba(255,215,87,0.16), rgba(13,18,33,0.98) 45%), linear-gradient(180deg, rgba(20,25,42,1), rgba(11,14,26,1))',
            }}
          >
            {/* Eyebrow */}
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/55">
              Mission Reward
            </div>

            {/* Title + description */}
            <h3 className="mt-2.5 text-[24px] font-black">{mission.title}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-white/65">{mission.description}</p>

            {/* Reward rows */}
            <div className="mt-5 grid gap-2.5">
              {rewardLines(mission).map((line) => (
                <div
                  key={line}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[15px] font-bold"
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-[18px] border border-white/12 bg-white/[0.04] py-3.5 text-[15px] font-bold text-white transition hover:bg-white/[0.08]"
              >
                Kapat
              </button>
              <button
                onClick={() => ready && onClaim(mission.id)}
                disabled={!ready}
                className={`flex-[1.2] rounded-[18px] py-3.5 text-[15px] font-black transition ${
                  ready
                    ? 'bg-[linear-gradient(135deg,#FFD166,#FFB347)] text-[#09101E] hover:brightness-105'
                    : 'cursor-not-allowed bg-white/10 text-white/40'
                }`}
              >
                {mission.claimed ? 'Alındı' : ready ? 'Ödülü Al' : 'Henüz Hazır Değil'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
