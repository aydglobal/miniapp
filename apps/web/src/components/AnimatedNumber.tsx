import { useEffect, useRef, useState } from 'react';

export function AnimatedNumber({
  value,
  compact = false,
  prefix = '',
  suffix = ''
}: {
  value: number;
  compact?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const previous = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = previous.current;
    const delta = value - start;

    // Küçük değişimlerde (<%5) direkt güncelle — gereksiz RAF yok
    if (Math.abs(delta) < Math.max(1, start * 0.05)) {
      previous.current = value;
      setDisplayValue(value);
      return;
    }

    const startTime = performance.now();
    const duration = 320;

    const tick = (time: number) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 2);
      setDisplayValue(start + delta * eased);

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        previous.current = value;
        setDisplayValue(value);
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{prefix}{formatValue(displayValue, compact)}{suffix}</>;
}

function formatValue(value: number, compact: boolean) {
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 1
  }).format(value);
}
