type Props = {
  clanName: string;
  rank: number;
  score: number;
  nextRankGap: number;
};

export default function ClanWarCard(props: Props) {
  return (
    <div className="rounded-3xl bg-neutral-950 p-5 text-white">
      <div className="text-xs uppercase opacity-70">Clan War</div>
      <div className="mt-1 text-xl font-semibold">{props.clanName}</div>
      <div className="mt-4 text-sm">Rank: #{props.rank}</div>
      <div className="text-sm">Score: {props.score.toLocaleString()}</div>
      <div className="text-sm opacity-80">Next rank gap: {props.nextRankGap.toLocaleString()}</div>
      <button className="mt-4 rounded-2xl bg-white/10 px-4 py-3">Open Clan Tasks</button>
    </div>
  );
}
