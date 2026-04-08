import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import PrimaryButton from "../ui/PrimaryButton";
import EmptyState from "../ui/EmptyState";
import { chests } from "../data/mock";

export default function ChestPage() {
  const ready = chests.filter((x) => x.ready);
  return (
    <GameLayout>
      <SectionCard title="Chest Vault" subtitle="Hazır sandıkları aç ve nadir ödüller yakala">
        {ready.length === 0 ? (
          <EmptyState title="Hazır sandık yok" body="Görevleri bitir ya da cooldown bekle." cta="Görevlere Git" />
        ) : (
          <div className="space-y-3">
            {chests.map((chest) => (
              <div key={chest.id} className="rounded-[22px] bg-white/5 p-4">
                <div className="font-semibold">{chest.title}</div>
                <div className="mt-1 text-sm text-[#A8B3CF]">{chest.rarityHint}</div>
                <PrimaryButton className="mt-4">{chest.ready ? "Aç" : "Hazır Değil"}</PrimaryButton>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </GameLayout>
  );
}
