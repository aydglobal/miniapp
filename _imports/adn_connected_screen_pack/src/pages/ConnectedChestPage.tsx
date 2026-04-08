import { useState } from "react";
import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import EmptyState from "../ui/EmptyState";
import PrimaryButton from "../ui/PrimaryButton";
import LoadingBlock from "../ui/LoadingBlock";
import ErrorBlock from "../ui/ErrorBlock";
import { useChests, useOpenChest } from "../hooks/useChests";
import { showToast } from "../lib/toast";

export default function ConnectedChestPage() {
  const chests = useChests();
  const openChest = useOpenChest();
  const [opened, setOpened] = useState<any>(null);

  if (chests.isLoading) return <GameLayout><LoadingBlock /></GameLayout>;
  if (chests.isError || !chests.data) return <GameLayout><ErrorBlock message={(chests.error as Error)?.message} /></GameLayout>;

  const ready = chests.data.items.filter((x) => x.ready);

  return (
    <GameLayout>
      <SectionCard title="Chest Vault" subtitle="Hazır sandıkları aç ve nadir ödüller yakala">
        {ready.length === 0 ? (
          <EmptyState title="Hazır sandık yok" body="Görevleri bitir ya da cooldown bekle." cta="Görevlere Git" />
        ) : (
          <div className="space-y-3">
            {chests.data.items.map((chest) => (
              <div key={chest.id} className="rounded-[22px] bg-white/5 p-4">
                <div className="font-semibold">{chest.title}</div>
                <div className="mt-1 text-sm text-[#A8B3CF]">{chest.rarityHint}</div>
                <PrimaryButton
                  className="mt-4"
                  disabled={!chest.ready || openChest.isPending}
                  onClick={async () => {
                    try {
                      const result = await openChest.mutateAsync(chest.id);
                      setOpened(result);
                      showToast(result.jackpot ? "JACKPOT!" : result.rarity.toUpperCase());
                    } catch (e: any) {
                      showToast("Sandık açılamadı", e.message);
                    }
                  }}
                >
                  {chest.ready ? "Aç" : "Hazır Değil"}
                </PrimaryButton>
              </div>
            ))}
          </div>
        )}

        {opened && (
          <div className="mt-4 rounded-[22px] bg-white/5 p-4 text-sm">
            <div className="font-semibold">{opened.rarity.toUpperCase()}</div>
            <div className="mt-2">ADN +{opened.rewards.adn}</div>
            <div>Shard +{opened.rewards.shards}</div>
            <div>Boost +{opened.rewards.boostMinutes}m</div>
          </div>
        )}
      </SectionCard>
    </GameLayout>
  );
}
