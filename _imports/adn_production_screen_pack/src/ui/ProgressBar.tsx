export default function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#46D7FF] to-[#8F6BFF]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
