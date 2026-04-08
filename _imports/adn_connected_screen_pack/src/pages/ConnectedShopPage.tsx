import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import PrimaryButton from "../ui/PrimaryButton";
import LoadingBlock from "../ui/LoadingBlock";
import ErrorBlock from "../ui/ErrorBlock";
import { usePurchaseShopItem, useShop } from "../hooks/useShop";
import { showToast } from "../lib/toast";

export default function ConnectedShopPage() {
  const shop = useShop();
  const purchase = usePurchaseShopItem();

  if (shop.isLoading) return <GameLayout><LoadingBlock /></GameLayout>;
  if (shop.isError || !shop.data) return <GameLayout><ErrorBlock message={(shop.error as Error)?.message} /></GameLayout>;

  return (
    <GameLayout>
      <SectionCard title="Upgrade Shop" subtitle="Saatlik ADN üretimini buradan büyüt">
        <div className="space-y-3">
          {shop.data.items.map((item) => (
            <div key={item.id} className="rounded-[22px] bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="mt-1 text-sm text-[#A8B3CF]">
                    Lv.{item.level} • +{item.incomeDelta}/s
                  </div>
                  {item.locked && <div className="mt-1 text-xs text-yellow-300">{item.lockReason}</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#A8B3CF]">Fiyat</div>
                  <div className="font-semibold">{item.price.toLocaleString()} ADN</div>
                </div>
              </div>
              <PrimaryButton
                disabled={item.locked || purchase.isPending}
                className="mt-4"
                onClick={async () => {
                  try {
                    await purchase.mutateAsync(item.id);
                    showToast("Upgrade alındı", item.name);
                  } catch (e: any) {
                    showToast("Satın alma başarısız", e.message);
                  }
                }}
              >
                Yükselt
              </PrimaryButton>
            </div>
          ))}
        </div>
      </SectionCard>
    </GameLayout>
  );
}
