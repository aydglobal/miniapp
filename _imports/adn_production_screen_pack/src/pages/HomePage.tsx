import GameLayout from "../ui/GameLayout";
import StatCard from "../ui/StatCard";
import ProgressBar from "../ui/ProgressBar";
import SectionCard from "../ui/SectionCard";
import PrimaryButton from "../ui/PrimaryButton";
import { profile } from "../data/mock";

export default function HomePage() {
  return (
    <GameLayout>
      <div className="space-y-4">
        <div className="rounded-[28px] bg-gradient-to-r from-[#8F6BFF]/30 to-[#46D7FF]/30 p-[1px]">
          <div className="rounded-[27px] bg-[#0B1224] p-5">
            <div className="text-xs uppercase tracking-wide text-[#A8B3CF]">Live Event</div>
            <div className="mt-1 text-2xl font-bold">{profile.event}</div>
            <div className="mt-2 text-sm text-[#A8B3CF]">Jackpot chance arttı. Sınırlı süre.</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard title="ADN" value={profile.adn.toLocaleString()} />
          <StatCard title="Saatlik" value={`${profile.hourly}/s`} accent="violet" />
          <StatCard title="Enerji" value={`${profile.energy}/${profile.energyMax}`} accent="pink" />
        </div>

        <SectionCard title="Tap Arena" subtitle={`Combo x${profile.combo}`}>
          <div className="grid place-items-center">
            <button className="h-56 w-56 rounded-full border border-white/10 bg-white/5 text-3xl font-bold shadow-[0_0_28px_rgba(143,107,255,0.24)] active:scale-95">
              TAP ADN
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-[#A8B3CF]">Crit ve combo ile daha hızlı büyü.</div>
        </SectionCard>

        <SectionCard title={`Level ${profile.level}`} subtitle="Bir sonraki kilide yaklaşıyorsun">
          <ProgressBar value={profile.xp} max={profile.xpMax} />
          <div className="mt-2 text-sm text-[#A8B3CF]">{profile.xp} / {profile.xpMax} XP</div>
        </SectionCard>

        <PrimaryButton>Görevlere Git</PrimaryButton>
      </div>
    </GameLayout>
  );
}
