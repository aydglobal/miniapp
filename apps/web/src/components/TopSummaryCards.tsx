type Card = { key: string; title: string; value: string };

export default function TopSummaryCards({ cards }: { cards: Card[] }) {
  return (
    <div className="game-summary-cards">
      {cards.map((card) => (
        <div key={card.key} className="game-summary-card">
          <div className="game-summary-card__label">{card.title}</div>
          <div className="game-summary-card__value">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
