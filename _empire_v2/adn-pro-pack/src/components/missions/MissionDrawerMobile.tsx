import { useMemo, useState } from 'react';
import type { MissionInstance } from '../../game/missions/dailyMissionGenerator';
import MissionClaimModal from './MissionClaimModal';

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

function categoryColor(category: MissionInstance['category']) {
  switch (category) {
    case 'event':
      return 'linear-gradient(135deg, rgba(255,98,98,0.18), rgba(255,122,0,0.18))';
    case 'vip':
      return 'linear-gradient(135deg, rgba(255,214,102,0.18), rgba(255,179,0,0.18))';
    default:
      return 'linear-gradient(135deg, rgba(61,179,255,0.14), rgba(102,87,255,0.14))';
  }
}

export default function MissionDrawerMobile({ open, missions, onClose, onClaim }: MissionDrawerMobileProps) {
  const [selectedMission, setSelectedMission] = useState<MissionInstance | null>(null);
  const completed = useMemo(() => missions.filter((mission) => mission.progress >= mission.target).length, [missions]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6,10,18,0.62)',
          backdropFilter: 'blur(6px)',
          zIndex: 400
        }}
      />

      <section
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 401,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          background: 'linear-gradient(180deg, rgba(17,22,37,1), rgba(9,11,20,1))',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -20px 80px rgba(0,0,0,0.45)',
          padding: '14px 14px 26px',
          maxHeight: '82vh',
          overflow: 'auto'
        }}
      >
        <div style={{ width: 54, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.16)', margin: '0 auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
              Mission Center
            </div>
            <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: 22 }}>Günlük görevler</h3>
          </div>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700
            }}
          >
            {completed}/{missions.length}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {missions.map((mission) => {
            const pct = progressPercent(mission.progress, mission.target);
            const ready = mission.progress >= mission.target;
            return (
              <button
                key={mission.id}
                onClick={() => setSelectedMission(mission)}
                style={{
                  textAlign: 'left',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: categoryColor(mission.category),
                  borderRadius: 22,
                  padding: 16,
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.6 }}>
                      {mission.category}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>{mission.title}</div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '6px 10px',
                      borderRadius: 999,
                      background: ready ? 'rgba(57,255,153,0.16)' : 'rgba(255,255,255,0.08)',
                      color: ready ? '#9fffc2' : 'rgba(255,255,255,0.72)'
                    }}
                  >
                    {mission.claimed ? 'ALINDI' : ready ? 'HAZIR' : 'AKTİF'}
                  </div>
                </div>

                <div style={{ marginTop: 10, color: 'rgba(255,255,255,0.68)', fontSize: 14, lineHeight: 1.5 }}>
                  {mission.description}
                </div>

                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      width: '100%',
                      height: 10,
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: ready ? 'linear-gradient(90deg, #76ffb7, #15d67d)' : 'linear-gradient(90deg, #56b6ff, #7366ff)'
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
                    {mission.progress}/{mission.target}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

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
