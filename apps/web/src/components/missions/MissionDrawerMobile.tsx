import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MissionInstance } from '../../game/missions/dailyMissionGenerator';
import MissionClaimModal from './MissionClaimModal';
import { springs, fades } from '../../motion/motionPresets';

type MissionDrawerMobileProps = {
  open: boolean;
  missions: MissionInstance[];
  onClose: () => void;
  onClaim: (missionId: string) => void;
};

function progressPercent(progress: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, (progress / target) * 100));
}

function categoryGradient(category: MissionInstance['category']) {
  switch (category) {
    case 'event': return 'from-[rgba(255,98,98,0.18)] to-[rgba(255,122,0,0.18)]';
    case 'vip':   return 'from-[rgba(255,214,102,0.18)] to-[rgba(255,179,0,0.18)]';
    default:      return 'from-[rgba(61,179,255,0.14)] to-[rgba(102,87,255,0.14)]';
  }
}

export default function MissionDrawerMobile({ open, missions, onClose, onClaim }: MissionDrawerMobileProps) {
  const [selectedMission, setSelectedMission] = useState<MissionInstance | null>(null);
  const completed = useMemo(() => missions.filter((m) => m.progress >= m.target).length, [missions]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-[6px]"
            />

            {/* Drawer */}
            <motion.section
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={springs.panel}
              className="fixed inset-x-0 bottom-0 z-[401] max-h-[82vh] overflow-auto rounded-t-[28px] border-t border-white/10 bg-[#0A1630]/96 p-4 pb-8 shadow-[0_-12px_38px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
            >
              {/* Handle */}
              <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/16" />

              {/* Header */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
                    Mission Center
                  </div>
                  <h3 className="mt-1 text-[22px] font-black text-white">Günlük Görevler</h3>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white">
                  {completed}/{missions.length}
                </div>
              </div>

              {/* Mission list */}
              <div className="grid gap-3">
                {missions.map((mission, i) => {
                  const pct = progressPercent(mission.progress, mission.target);
                  const ready = mission.progress >= mission.target && !mission.claimed;
                  return (
                    <motion.button
                      key={mission.id}
                      {...fades.up}
                      transition={{ ...springs.card, delay: i * 0.04 }}
                      onClick={() => setSelectedMission(mission)}
                      className={`w-full rounded-[22px] border border-white/10 bg-gradient-to-br ${categoryGradient(mission.category)} p-4 text-left`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                            {mission.category}
                          </div>
                          <div className="mt-1.5 text-[18px] font-black text-white">{mission.title}</div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                            mission.claimed
                              ? 'bg-white/10 text-white/50'
                              : ready
                              ? 'bg-[rgba(57,255,153,0.16)] text-[#9fffc2]'
                              : 'bg-white/[0.08] text-white/70'
                          }`}
                        >
                          {mission.claimed ? 'ALINDI' : ready ? 'HAZIR' : 'AKTİF'}
                        </span>
                      </div>

                      <p className="mt-2 text-[14px] leading-relaxed text-white/65">
                        {mission.description}
                      </p>

                      <div className="mt-3">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className={`h-full rounded-full ${ready ? 'bg-gradient-to-r from-[#76ffb7] to-[#15d67d]' : 'bg-gradient-to-r from-[#56b6ff] to-[#7366ff]'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="mt-1.5 text-[13px] text-white/60">
                          {mission.progress}/{mission.target}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>

      <MissionClaimModal
        open={Boolean(selectedMission)}
        mission={selectedMission}
        onClose={() => setSelectedMission(null)}
        onClaim={(missionId) => {
          onClaim(missionId);
          setSelectedMission(null);
        }}
      />
    </>
  );
}
