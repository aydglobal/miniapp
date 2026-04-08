import { useMemo, useState } from "react";

type Floating = { id: number; x: number; y: number; text: string; crit?: boolean };

export default function TapArena() {
  const [combo, setCombo] = useState(0);
  const [floating, setFloating] = useState<Floating[]>([]);

  function onTap(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const item = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      text: combo >= 15 ? "+2 ADN" : "+1 ADN",
      crit: Math.random() < 0.05,
    };

    setCombo((v) => v + 1);
    setFloating((v) => [...v, item]);

    setTimeout(() => {
      setFloating((v) => v.filter((f) => f.id !== item.id));
    }, 900);
  }

  const comboLabel = useMemo(() => {
    if (combo >= 50) return "Combo x2.2";
    if (combo >= 30) return "Combo x1.7";
    if (combo >= 15) return "Combo x1.35";
    if (combo >= 5) return "Combo x1.15";
    return "No Combo";
  }, [combo]);

  return (
    <div className="relative p-6 rounded-3xl bg-neutral-950 text-white">
      <div className="mb-4 text-sm opacity-80">{comboLabel}</div>
      <button
        onClick={onTap}
        className="relative h-52 w-52 rounded-full bg-white/10 active:scale-95 transition"
      >
        TAP ADN
      </button>

      {floating.map((f) => (
        <div
          key={f.id}
          className={`absolute text-sm font-bold pointer-events-none ${f.crit ? "text-yellow-300" : "text-cyan-300"}`}
          style={{ left: f.x + 40, top: f.y + 40 }}
        >
          {f.crit ? "CRIT " : ""}{f.text}
        </div>
      ))}
    </div>
  );
}
