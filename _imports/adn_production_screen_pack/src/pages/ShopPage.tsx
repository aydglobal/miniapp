import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import PrimaryButton from "../ui/PrimaryButton";
import { upgrades } from "../data/mock";

export default function ShopPage() {
  return (
    <GameLayout>
      <div className="space-y-4">
        <SectionCard title="Upgrade Shop" subtitle="Saatlik ADN üretimini buradan büyüt">
          <div className="space-y-3">
            {upgrades.map((item) => (
              <div key={item.id} className="rounded-[22px] bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="mt-1 text-sm text-[#A8B3CF]">
                      Lv.{item.level} • +{item.income}/s
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#A8B3CF]">Fiyat</div>
                    <div className="font-semibold">{item.price.toLocaleString()} ADN</div>
                  </div>
                </div>
                <PrimaryButton className="mt-4">Yükselt</PrimaryButton>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </GameLayout>
  );
}
