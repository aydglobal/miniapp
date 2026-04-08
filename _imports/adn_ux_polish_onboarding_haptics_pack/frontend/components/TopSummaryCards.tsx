type Card = { key: string; title: string; value: string };

export default function TopSummaryCards({ cards }: { cards: Card[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div key={card.key} className="rounded-3xl border border-white/10 bg-[#0B1224] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <div className="text-[11px] uppercase tracking-wide text-[#A8B3CF]">{card.title}</div>
          <div className="mt-2 text-lg font-semibold text-white">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
