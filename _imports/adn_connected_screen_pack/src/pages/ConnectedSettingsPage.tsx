import GameLayout from "../ui/GameLayout";
import SectionCard from "../ui/SectionCard";
import PrimaryButton from "../ui/PrimaryButton";
import LoadingBlock from "../ui/LoadingBlock";
import ErrorBlock from "../ui/ErrorBlock";
import { useSaveSettings, useSettings } from "../hooks/useSettings";
import { showToast } from "../lib/toast";

function ToggleRow({
  label,
  on,
  setOn,
}: {
  label: string;
  on: boolean;
  setOn: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[22px] bg-white/5 px-4 py-4">
      <span>{label}</span>
      <button onClick={() => setOn(!on)} className={`rounded-full px-3 py-1 text-sm ${on ? "bg-[#35E0A1]/20 text-[#35E0A1]" : "bg-white/10 text-[#A8B3CF]"}`}>
        {on ? "Açık" : "Kapalı"}
      </button>
    </div>
  );
}

export default function ConnectedSettingsPage() {
  const settings = useSettings();
  const save = useSaveSettings();

  if (settings.isLoading) return <GameLayout><LoadingBlock /></GameLayout>;
  if (settings.isError || !settings.data) return <GameLayout><ErrorBlock message={(settings.error as Error)?.message} /></GameLayout>;

  const data = settings.data.settings;

  return (
    <GameLayout>
      <SectionCard title="Ayarlar" subtitle="Feedback ve deneyim ayarları">
        <div className="space-y-3">
          <ToggleRow label="Ses" on={data.sound} setOn={(v) => (data.sound = v)} />
          <ToggleRow label="Haptic" on={data.haptics} setOn={(v) => (data.haptics = v)} />
          <ToggleRow label="Bildirim" on={data.notifications} setOn={(v) => (data.notifications = v)} />
          <ToggleRow label="Ambient" on={data.ambient} setOn={(v) => (data.ambient = v)} />
        </div>
        <PrimaryButton
          className="mt-4"
          disabled={save.isPending}
          onClick={async () => {
            try {
              await save.mutateAsync(data);
              showToast("Ayarlar kaydedildi");
            } catch (e: any) {
              showToast("Kayıt başarısız", e.message);
            }
          }}
        >
          Kaydet
        </PrimaryButton>
      </SectionCard>
    </GameLayout>
  );
}
