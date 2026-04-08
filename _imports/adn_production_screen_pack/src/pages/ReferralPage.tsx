import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import StatCard from "../ui/StatCard";
import PrimaryButton from "../ui/PrimaryButton";
import { referrals } from "../data/mock";

export default function ReferralPage() {
  return (
    <GameLayout>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Toplam" value={String(referrals.total)} />
          <StatCard title="Aktif" value={String(referrals.active)} accent="violet" />
          <StatCard title="Bekleyen" value={`${referrals.pendingReward} ADN`} accent="yellow" />
        </div>

        <SectionCard title="Referral Kodun" subtitle="Sadece aktif oyuncular tam sayılır">
          <div className="rounded-[22px] bg-white/5 px-4 py-4 font-mono">{referrals.code}</div>
          <PrimaryButton className="mt-4">Kodu Kopyala</PrimaryButton>
        </SectionCard>

        <SectionCard title="Referral Zinciri" subtitle="Kaliteli referral daha çok ödül açar">
          <div className="space-y-2 text-sm text-[#A8B3CF]">
            <div>1 referral → 120 ADN</div>
            <div>3 aktif referral → Free Chest</div>
            <div>5 aktif referral → x2 Boost 30m</div>
            <div>10 aktif referral → Premium görev zinciri</div>
          </div>
        </SectionCard>
      </div>
    </GameLayout>
  );
}
