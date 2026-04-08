import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import StatCard from "../ui/StatCard";
import PrimaryButton from "../ui/PrimaryButton";
import { clan } from "../data/mock";

export default function ClanPage() {
  return (
    <GameLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Rank" value={`#${clan.rank}`} />
          <StatCard title="Score" value={clan.score.toLocaleString()} accent="violet" />
          <StatCard title="Üye" value={String(clan.members)} accent="pink" />
        </div>

        <SectionCard title={clan.name} subtitle={`Üst sıraya ${clan.nextGap.toLocaleString()} puan kaldı`}>
          <PrimaryButton>Clan Görevlerini Aç</PrimaryButton>
        </SectionCard>

        <SectionCard title="Haftalık Clan Görevleri" subtitle="Birlikte oynadıkça sandık büyür">
          <div className="space-y-3">
            {[
              "150k toplam tap",
              "10 aktif üye login",
              "3 referral tamamlayan üye",
            ].map((task) => (
              <div key={task} className="rounded-[22px] bg-white/5 p-4">{task}</div>
            ))}
          </div>
        </SectionCard>
      </div>
    </GameLayout>
  );
}
