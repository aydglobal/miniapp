import React from "react";
import clsx from "clsx";

type Variant = "primary" | "gold" | "rbrt";
type Props = { value: number; max?: number; variant?: Variant; className?: string; };

export default function ProgressBar({ value, max = 100, variant = "primary", className }: Props) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={clsx("adn-progress-track", className)}>
      <div
        className={clsx(
          variant === "primary" && "adn-progress-fill",
          variant === "gold" && "adn-progress-fill-gold",
          variant === "rbrt" && "adn-progress-fill-rbrt"
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
