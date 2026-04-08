import { useState } from "react";
import GameShell from "../components/GameShell";
import TopSummaryCards from "../components/TopSummaryCards";
import PrimaryActionButton from "../components/PrimaryActionButton";
import OnboardingOverlay from "../components/OnboardingOverlay";
import RewardToast from "../components/RewardToast";

const steps = ["welcome", "tap_once", "open_shop", "buy_upgrade", "open_missions", "open_referral", "finish"] as const;
type Step = typeof steps[number];

export default function HomePolishExample() {
  const [stepIndex, setStepIndex] = useState(0);

  const cards = [
    { key: "adn", title: "ADN", value: "14,280" },
    { key: "income", title: "Saatlik", value: "3,420/s" },
    { key: "energy", title: "Enerji", value: "92/100" },
  ];

  return (
    <GameShell>
      <div className="space-y-4">
        <div className="rounded-[28px] bg-gradient-to-r from-[#8F6BFF]/30 to-[#46D7FF]/30 p-[1px]">
          <div className="rounded-[27px] bg-[#0B1224] p-5">
            <div className="text-xs uppercase tracking-wide text-[#A8B3CF]">Limited Event</div>
            <div className="mt-1 text-2xl font-bold">Lucky Chest Night</div>
            <div className="mt-2 text-sm text-[#A8B3CF]">Jackpot şansı 6 saat boyunca daha yüksek.</div>
          </div>
        </div>

        <TopSummaryCards cards={cards} />

        <div className="rounded-[32px] bg-[#0B1224] p-6 text-center shadow-[0_0_28px_rgba(143,107,255,0.24)]">
          <div className="mx-auto grid h-56 w-56 place-items-center rounded-full border border-white/10 bg-white/5 text-3xl font-bold">
            TAP ADN
          </div>
          <div className="mt-4 text-sm text-[#A8B3CF]">Combo x1.35 aktif</div>
        </div>

        <RewardToast title="Görev hazır" body="İlk kartını yükselt ve free chest kazan." />

        <PrimaryActionButton>Görevlere Git</PrimaryActionButton>
      </div>

      <OnboardingOverlay
        step={steps[stepIndex]}
        onNext={() => setStepIndex((v) => Math.min(v + 1, steps.length - 1))}
      />
    </GameShell>
  );
}
