import type { MissionInstance } from '../../game/missions/dailyMissionGenerator';

type MissionClaimModalProps = {
  open: boolean;
  mission: MissionInstance | null;
  onClose: () => void;
  onClaim: (missionId: string) => void;
};

function rewardLines(mission: MissionInstance | null) {
  if (!mission) return [];
  const lines: string[] = [];
  if (mission.reward.coins) lines.push(`+${mission.reward.coins} ADN`);
  if (mission.reward.gems) lines.push(`+${mission.reward.gems} Gem`);
  if (mission.reward.keys) lines.push(`+${mission.reward.keys} Key`);
  if (mission.reward.boost) {
    lines.push(
      `${mission.reward.boost.type.toUpperCase()} x${mission.reward.boost.multiplier} · ${mission.reward.boost.durationMinutes} dk`
    );
  }
  return lines;
}

export default function MissionClaimModal({ open, mission, onClose, onClaim }: MissionClaimModalProps) {
  if (!open || !mission) return null;

  const ready = mission.progress >= mission.target && !mission.claimed;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,8,18,0.72)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 999
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(92vw, 420px)',
          borderRadius: 24,
          padding: 24,
          background:
            'radial-gradient(circle at top, rgba(255,215,87,0.16), rgba(13,18,33,0.98) 45%), linear-gradient(180deg, rgba(20,25,42,1), rgba(11,14,26,1))',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          color: '#fff'
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', opacity: 0.65 }}>
          Mission Reward
        </div>
        <h3 style={{ margin: '10px 0 6px', fontSize: 24 }}>{mission.title}</h3>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.68)', lineHeight: 1.5 }}>{mission.description}</p>

        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          {rewardLines(mission).map((line) => (
            <div
              key={line}
              style={{
                padding: '10px 12px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontWeight: 700
              }}
            >
              {line}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              padding: '14px 16px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Kapat
          </button>
          <button
            onClick={() => onClaim(mission.id)}
            disabled={!ready}
            style={{
              flex: 1.2,
              borderRadius: 16,
              border: 'none',
              background: ready ? 'linear-gradient(135deg, #ffd84d, #ff9f0a)' : 'rgba(255,255,255,0.1)',
              color: ready ? '#1a1300' : 'rgba(255,255,255,0.5)',
              padding: '14px 16px',
              fontWeight: 800,
              cursor: ready ? 'pointer' : 'not-allowed'
            }}
          >
            {mission.claimed ? 'Alındı' : ready ? 'Ödülü Al' : 'Henüz Hazır Değil'}
          </button>
        </div>
      </div>
    </div>
  );
}
