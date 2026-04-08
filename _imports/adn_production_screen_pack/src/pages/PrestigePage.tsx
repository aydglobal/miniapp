import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import PrimaryButton from "../ui/PrimaryButton";

export default function PrestigePage() {
  return (
    <GameLayout>
      <div className="space-y-4">
        <SectionCard title="Prestige Reactor" subtitle="Reset ol, Nebula Core al, kalıcı güç kazan">
          <div className="space-y-2 text-sm text-[#A8B3CF]">
            <div>Gereken level: 20</div>
            <div>Gereken saatlik üretim: 5,000 ADN/s</div>
            <div>Tahmini Nebula Core: +7</div>
          </div>
          <div className="mt-4 rounded-[22px] bg-white/5 p-4 text-sm">
            Reset sonrası kart seviyelerin sıfırlanır, ama kalıcı meta bonusların açılır.
          </div>
          <PrimaryButton className="mt-4">Prestige Yap</PrimaryButton>
        </SectionCard>

        <SectionCard title="Meta Skill Tree" subtitle="Kalıcı güç burada">
          <div className="space-y-3">
            {[
              "Tap Mastery +%2 / level",
              "Crit Lab +%0.4 / level",
              "Offline Vault +%5 / level",
            ].map((line) => (
              <div key={line} className="rounded-[22px] bg-white/5 px-4 py-4">{line}</div>
            ))}
          </div>
        </SectionCard>
      </div>
    </GameLayout>
  );
}
