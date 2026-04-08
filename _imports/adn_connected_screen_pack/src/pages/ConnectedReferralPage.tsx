import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import StatCard from "../ui/StatCard";
import PrimaryButton from "../ui/PrimaryButton";
import LoadingBlock from "../ui/LoadingBlock";
import ErrorBlock from "../ui/ErrorBlock";
import { useReferral } from "../hooks/useReferral";
import { showToast } from "../lib/toast";

export default function ConnectedReferralPage() {
  const referral = useReferral();

  if (referral.isLoading) return <GameLayout><LoadingBlock /></GameLayout>;
  if (referral.isError || !referral.data) return <GameLayout><ErrorBlock message={(referral.error as Error)?.message} /></GameLayout>;

  const data = referral.data;

  return (
    <GameLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Toplam" value={String(data.total)} />
          <StatCard title="Aktif" value={String(data.active)} accent="violet" />
          <StatCard title="Bekleyen" value={`${data.pendingReward} ADN`} accent="yellow" />
        </div>

        <SectionCard title="Referral Kodun" subtitle="Sadece aktif oyuncular tam sayılır">
          <div className="rounded-[22px] bg-white/5 px-4 py-4 font-mono">{data.code}</div>
          <PrimaryButton
            className="mt-4"
            onClick={async () => {
              await navigator.clipboard.writeText(data.code);
              showToast("Kopyalandı", data.code);
            }}
          >
            Kodu Kopyala
          </PrimaryButton>
        </SectionCard>
      </div>
    </GameLayout>
  );
}
