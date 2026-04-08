import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import StatCard from "../ui/StatCard";
import LoadingBlock from "../ui/LoadingBlock";
import ErrorBlock from "../ui/ErrorBlock";
import EmptyState from "../ui/EmptyState";
import { useClan } from "../hooks/useClan";

export default function ConnectedClanPage() {
  const clan = useClan();

  if (clan.isLoading) return <GameLayout><LoadingBlock /></GameLayout>;
  if (clan.isError || !clan.data) return <GameLayout><ErrorBlock message={(clan.error as Error)?.message} /></GameLayout>;

  if (!clan.data.clan) {
    return <GameLayout><EmptyState title="Clan'in yok" body="Bir clan kur ya da mevcut bir clan'e katıl." cta="Clan Bul" /></GameLayout>;
  }

  const data = clan.data.clan;

  return (
    <GameLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Rank" value={`#${data.rank}`} />
          <StatCard title="Score" value={data.score.toLocaleString()} accent="violet" />
          <StatCard title="Üye" value={String(data.members)} accent="pink" />
        </div>

        <SectionCard title={data.name} subtitle={`Üst sıraya ${data.nextGap.toLocaleString()} puan kaldı`}>
          <div className="space-y-3 text-sm text-[#A8B3CF]">
            <div>150k toplam tap</div>
            <div>10 aktif üye login</div>
            <div>3 referral tamamlayan üye</div>
          </div>
        </SectionCard>
      </div>
    </GameLayout>
  );
}
