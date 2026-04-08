type Props = {
  canPrestige: boolean;
  estimatedCore: number;
  estimatedPower: number;
};

export default function PrestigePanel(props: Props) {
  return (
    <div className="rounded-3xl bg-neutral-950 p-5 text-white">
      <div className="text-lg font-semibold">Prestige Reactor</div>
      <div className="mt-2 text-sm opacity-80">
        Reset current card progress, gain permanent Nebula Core and unlock meta upgrades.
      </div>
      <div className="mt-4 space-y-1 text-sm">
        <div>Prestige Power: {props.estimatedPower}</div>
        <div>Nebula Core: +{props.estimatedCore}</div>
      </div>
      <button
        disabled={!props.canPrestige}
        className="mt-4 rounded-2xl bg-white/10 px-4 py-3 disabled:opacity-40"
      >
        Prestige Now
      </button>
    </div>
  );
}
