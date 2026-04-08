export default function StatCard({
  title,
  value,
  accent = "cyan",
}: {
  title: string;
  value: string;
  accent?: "cyan" | "violet" | "pink" | "yellow";
}) {
  const accents: Record<string, string> = {
    cyan: "shadow-[0_0_24px_rgba(70,215,255,0.18)]",
    violet: "shadow-[0_0_24px_rgba(143,107,255,0.18)]",
    pink: "shadow-[0_0_24px_rgba(255,95,203,0.16)]",
    yellow: "shadow-[0_0_24px_rgba(255,216,77,0.16)]",
  };

  return (
    <div className={`rounded-[24px] border border-white/10 bg-[#0B1224] p-4 ${accents[accent]}`}>
      <div className="text-[11px] uppercase tracking-wide text-[#A8B3CF]">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}
