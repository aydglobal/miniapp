type Props = {
  open: boolean;
  rarity?: string;
  rewards?: { adn: number; shards: number; boostMinutes: number };
  jackpot?: boolean;
  onClose: () => void;
};

export default function ChestRevealModal(props: Props) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 grid place-items-center bg-black/70">
      <div className="w-[340px] rounded-3xl bg-neutral-900 p-6 text-white shadow-2xl">
        <div className="text-xs uppercase opacity-70 mb-2">Chest Opened</div>
        <div className="text-2xl font-bold mb-3">{props.rarity}</div>
        <div className="space-y-2 text-sm">
          <div>ADN: +{props.rewards?.adn ?? 0}</div>
          <div>Shards: +{props.rewards?.shards ?? 0}</div>
          <div>Boost: +{props.rewards?.boostMinutes ?? 0} min</div>
          {props.jackpot && <div className="text-yellow-300 font-semibold">JACKPOT!</div>}
        </div>
        <button onClick={props.onClose} className="mt-5 w-full rounded-2xl bg-white/10 py-3">
          Continue
        </button>
      </div>
    </div>
  );
}
