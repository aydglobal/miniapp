import { useState } from "react";
import { setAudioEnabled, setAudioVolume } from "../audio/audioEngine";

export default function FeedbackSettingsCard() {
  const [sound, setSound] = useState(true);
  const [volume, setVolumeState] = useState(60);
  const [haptics, setHaptics] = useState(true);

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#0B1224] p-5 text-white">
      <div className="text-lg font-semibold">Feedback Ayarları</div>

      <div className="mt-4 flex items-center justify-between">
        <span>Ses</span>
        <button
          onClick={() => {
            const next = !sound;
            setSound(next);
            setAudioEnabled(next);
          }}
          className="rounded-full bg-white/10 px-3 py-2 text-sm"
        >
          {sound ? "Açık" : "Kapalı"}
        </button>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-sm text-[#A8B3CF]">Ses seviyesi</div>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => {
            const next = Number(e.target.value);
            setVolumeState(next);
            setAudioVolume(next / 100);
          }}
          className="w-full"
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span>Haptic</span>
        <button
          onClick={() => setHaptics((v) => !v)}
          className="rounded-full bg-white/10 px-3 py-2 text-sm"
        >
          {haptics ? "Açık" : "Kapalı"}
        </button>
      </div>
    </div>
  );
}
