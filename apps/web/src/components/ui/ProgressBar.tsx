type Variant = 'primary' | 'gold' | 'rbrt' | 'energy';

type Props = {
  value: number;
  max?: number;
  variant?: Variant;
  className?: string;
};

const fillClass: Record<Variant, string> = {
  primary: 'game-progress-fill',
  gold: 'game-progress-fill-gold',
  rbrt: 'game-progress-fill-rbrt',
  energy: 'game-progress-fill-energy'
};

export default function ProgressBar({ value, max = 100, variant = 'primary', className = '' }: Props) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`game-progress-track ${className}`}>
      <div className={fillClass[variant]} style={{ width: `${width}%` }} />
    </div>
  );
}
