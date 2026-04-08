import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import ProgressBar from "../ui/ProgressBar";
import PrimaryButton from "../ui/PrimaryButton";
import { missions } from "../data/mock";

export default function MissionsPage() {
  return (
    <GameLayout>
      <SectionCard title="Görevler" subtitle="Hızlı ilerleme için önce bunları bitir">
        <div className="space-y-3">
          {missions.map((mission) => (
            <div key={mission.id} className="rounded-[22px] bg-white/5 p-4">
              <div className="font-semibold">{mission.title}</div>
              <div className="mt-2">
                <ProgressBar value={mission.progress} max={mission.max} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[#A8B3CF]">{mission.progress} / {mission.max}</span>
                <span className="text-[#46D7FF]">{mission.reward}</span>
              </div>
              <PrimaryButton className="mt-4">{mission.progress >= mission.max ? "Ödülü Al" : "Göreve Git"}</PrimaryButton>
            </div>
          ))}
        </div>
      </SectionCard>
    </GameLayout>
  );
}
