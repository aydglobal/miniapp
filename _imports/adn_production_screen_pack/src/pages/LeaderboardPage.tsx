import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import { leaderboard } from "../data/mock";

export default function LeaderboardPage() {
  return (
    <GameLayout>
      <SectionCard title="Leaderboard" subtitle="Global sıralama ve kendi konumun">
        <div className="space-y-3">
          {leaderboard.map((row) => (
            <div
              key={`${row.rank}-${row.name}`}
              className={`flex items-center justify-between rounded-[22px] p-4 ${row.name === "You" ? "bg-[#46D7FF]/10 ring-1 ring-[#46D7FF]/30" : "bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 text-sm text-[#A8B3CF]">#{row.rank}</div>
                <div className="font-semibold">{row.name}</div>
              </div>
              <div className="text-sm text-[#A8B3CF]">{row.score.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </GameLayout>
  );
}
