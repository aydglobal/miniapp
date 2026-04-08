import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import ProgressBar from "../ui/ProgressBar";
import PrimaryButton from "../ui/PrimaryButton";
import LoadingBlock from "../ui/LoadingBlock";
import ErrorBlock from "../ui/ErrorBlock";
import { useClaimMission, useMissions } from "../hooks/useMissions";
import { showToast } from "../lib/toast";

export default function ConnectedMissionsPage() {
  const missions = useMissions();
  const claim = useClaimMission();

  if (missions.isLoading) return <GameLayout><LoadingBlock /></GameLayout>;
  if (missions.isError || !missions.data) return <GameLayout><ErrorBlock message={(missions.error as Error)?.message} /></GameLayout>;

  return (
    <GameLayout>
      <SectionCard title="Görevler" subtitle="Hızlı ilerleme için önce bunları bitir">
        <div className="space-y-3">
          {missions.data.items.map((mission) => (
            <div key={mission.id} className="rounded-[22px] bg-white/5 p-4">
              <div className="font-semibold">{mission.title}</div>
              <div className="mt-2">
                <ProgressBar value={mission.progress} max={mission.max} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[#A8B3CF]">{mission.progress} / {mission.max}</span>
                <span className="text-[#46D7FF]">{mission.rewardLabel}</span>
              </div>
              <PrimaryButton
                className="mt-4"
                disabled={!mission.isClaimable || claim.isPending}
                onClick={async () => {
                  try {
                    await claim.mutateAsync(mission.id);
                    showToast("Görev ödülü alındı", mission.title);
                  } catch (e: any) {
                    showToast("Claim başarısız", e.message);
                  }
                }}
              >
                {mission.isClaimable ? "Ödülü Al" : "Devam Et"}
              </PrimaryButton>
            </div>
          ))}
        </div>
      </SectionCard>
    </GameLayout>
  );
}
