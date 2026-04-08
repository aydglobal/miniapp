import React, { useEffect, useState } from "react";

type Props = { value: number; duration?: number; formatter?: (n: number) => string; };

export default function AnimatedNumber({ value, duration = 450, formatter = (n) => String(Math.floor(n)) }: Props) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = performance.now();
    const initial = display;
    let raf = 0;
    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / duration);
      const next = initial + (value - initial) * progress;
      setDisplay(next);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{formatter(display)}</>;
}
