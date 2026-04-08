import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import { settings } from "../data/mock";

function Toggle({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-[22px] bg-white/5 px-4 py-4">
      <span>{label}</span>
      <span className={`rounded-full px-3 py-1 text-sm ${on ? "bg-[#35E0A1]/20 text-[#35E0A1]" : "bg-white/10 text-[#A8B3CF]"}`}>
        {on ? "Açık" : "Kapalı"}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <GameLayout>
      <SectionCard title="Ayarlar" subtitle="Feedback ve deneyim ayarları">
        <div className="space-y-3">
          <Toggle label="Ses" on={settings.sound} />
          <Toggle label="Haptic" on={settings.haptics} />
          <Toggle label="Bildirim" on={settings.notifications} />
          <Toggle label="Ambient" on={settings.ambient} />
        </div>
      </SectionCard>
    </GameLayout>
  );
}
