type Props = {
  multiplier: number;
  count: number;
  visible: boolean;
};

export default function ComboDisplay({ multiplier, count, visible }: Props) {
  if (!visible && count === 0) return null;

  const label =
    multiplier >= 3.0 ? 'COMBO x3.0 🔥' :
    multiplier >= 2.0 ? 'COMBO x2.0 ⚡' :
    `COMBO x${multiplier.toFixed(1)}`;

  return (
    <div
      className="game-combo-display"
      style={{
        animation: !visible ? 'gameComboFadeOut 400ms ease forwards' : undefined
      }}
      aria-live="polite"
      aria-label={`Combo çarpanı: ${multiplier}`}
    >
      <span className="game-combo-display__label">{label}</span>
      <span className="game-combo-display__count">{count} vuruş</span>
    </div>
  );
}
