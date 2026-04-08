import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import PrimaryButton from "../ui/PrimaryButton";
import LoadingBlock from "../ui/LoadingBlock";
import ErrorBlock from "../ui/ErrorBlock";
import { useActivatePrestige, usePrestigeSummary } from "../hooks/usePrestige";
import { showToast } from "../lib/toast";

export default function ConnectedPrestigePage() {
  const summary = usePrestigeSummary();
  const activate = useActivatePrestige();

  if (summary.isLoading) return <GameLayout><LoadingBlock /></GameLayout>;
  if (summary.isError || !summary.data) return <GameLayout><ErrorBlock message={(summary.error as Error)?.message} /></GameLayout>;

  const data = summary.data;

  return (
    <GameLayout>
      <div className="space-y-4">
        <SectionCard title="Prestige Reactor" subtitle="Reset ol, Nebula Core al, kalıcı güç kazan">
          <div className="space-y-2 text-sm text-[#A8B3CF]">
            {data.requirements.map((req) => <div key={req}>{req}</div>)}
            <div>Tahmini Nebula Core: +{data.estimatedCore}</div>
            <div>Prestige Power: {data.estimatedPower}</div>
          </div>

          <PrimaryButton
            className="mt-4"
            disabled={!data.canPrestige || activate.isPending}
            onClick={async () => {
              try {
                await activate.mutateAsync();
                showToast("Prestige tamamlandı");
              } catch (e: any) {
                showToast("Prestige başarısız", e.message);
              }
            }}
          >
            Prestige Yap
          </PrimaryButton>
        </SectionCard>
      </div>
    </GameLayout>
  );
}
