import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: ReactNode;
  note?: string;
  badge?: string;
  tone?: 'default' | 'gold' | 'cyan' | 'pink';
};

const toneClass: Record<string, string> = {
  default: 'game-signal-card',
  gold: 'game-signal-card game-signal-card--gold',
  cyan: 'game-signal-card game-signal-card--cyan',
  pink: 'game-signal-card game-signal-card--pink'
};

export default function StatCard({ label, value, note, badge, tone = 'default' }: Props) {
  return (
    <div className={toneClass[tone]}>
      <div className="game-signal-card__label">{label}</div>
      <div className="game-signal-card__value">{value}</div>
      {note ? <div className="game-signal-card__note">{note}</div> : null}
      {badge ? <span className="game-badge game-badge--active mt-2 inline-block">{badge}</span> : null}
    </div>
  );
}
