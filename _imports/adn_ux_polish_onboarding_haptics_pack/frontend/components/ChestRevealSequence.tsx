type Props = {
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  jackpot?: boolean;
  rewards: { adn: number; shards: number; boostMinutes: number };
  onDone: () => void;
};

export default function ChestRevealSequence(props: Props) {
  const color =
    props.rarity === "mythic"
      ? "from-[#FFD84D] to-[#FF5FCB]"
      : props.rarity === "legendary"
      ? "from-[#8F6BFF] to-[#46D7FF]"
      : props.rarity === "epic"
      ? "from-[#46D7FF] to-[#35E0A1]"
      : "from-white/20 to-white/5";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80">
      <div className={`w-[340px] rounded-[30px] border border-white/10 bg-gradient-to-b ${color} p-[1px]`}>
        <div className="rounded-[29px] bg-[#050816] p-6 text-white">
          <div className="text-center text-xs uppercase tracking-wide text-[#A8B3CF]">Chest Reveal</div>
          <div className="mt-4 text-center text-3xl font-bold">{props.rarity.toUpperCase()}</div>
          {props.jackpot && <div className="mt-2 text-center text-sm font-semibold text-[#FFD84D]">JACKPOT</div>}
          <div className="mt-5 space-y-2 rounded-[22px] bg-white/5 p-4 text-sm">
            <div>ADN +{props.rewards.adn}</div>
            <div>Shard +{props.rewards.shards}</div>
            <div>Boost +{props.rewards.boostMinutes}m</div>
          </div>
          <button
            onClick={props.onDone}
            className="mt-5 w-full rounded-[18px] bg-white/10 px-4 py-4"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
