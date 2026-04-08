import GameLayout from "../ui/GameLayout";
import StatCard from "../ui/StatCard";
import SectionCard from "../ui/SectionCard";
import ProgressBar from "../ui/ProgressBar";
import PrimaryButton from "../ui/PrimaryButton";
import LoadingBlock from "../ui/LoadingBlock";
import ErrorBlock from "../ui/ErrorBlock";
import { useProfile } from "../hooks/useProfile";
import { useTap } from "../hooks/useTap";
import { showToast } from "../lib/toast";

export default function ConnectedHomePage() {
  const profile = useProfile();
  const tap = useTap();

  if (profile.isLoading) {
    return <GameLayout><LoadingBlock /></GameLayout>;
  }

  if (profile.isError || !profile.data) {
    return <GameLayout><ErrorBlock message={(profile.error as Error)?.message} /></GameLayout>;
  }

  const user = profile.data.user;

  return (
    <GameLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="ADN" value={user.coins.toLocaleString()} />
          <StatCard title="Saatlik" value={`${user.passiveIncomePerHour}/s`} accent="violet" />
          <StatCard title="Enerji" value={`${user.energy}/${user.energyMax}`} accent="pink" />
        </div>

        <SectionCard title="Tap Arena" subtitle="Crit ve combo ile daha hızlı büyü">
          <div className="grid place-items-center">
            <button
              disabled={tap.isPending}
              onClick={async () => {
                try {
                  const result = await tap.mutateAsync();
                  showToast(result.isCrit ? "CRIT!" : `+${result.reward} ADN`);
                  profile.refetch();
                } catch (e: any) {
                  showToast("Tap başarısız", e.message);
                }
              }}
              className="h-56 w-56 rounded-full border border-white/10 bg-white/5 text-3xl font-bold active:scale-95 disabled:opacity-50"
            >
              {tap.isPending ? "..." : "TAP ADN"}
            </button>
          </div>
        </SectionCard>

        <SectionCard title={`Level ${user.level}`} subtitle="Bir sonraki kilide yaklaşıyorsun">
          <ProgressBar value={user.xp} max={user.xpMax} />
          <div className="mt-2 text-sm text-[#A8B3CF]">{user.xp} / {user.xpMax} XP</div>
        </SectionCard>

        <PrimaryButton onClick={() => profile.refetch()}>Profili Yenile</PrimaryButton>
      </div>
    </GameLayout>
  );
}
