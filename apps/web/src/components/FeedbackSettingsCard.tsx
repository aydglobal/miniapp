import { useState } from 'react';

let _audioEnabled = true;
let _audioVolume = 0.6;

export function setAudioEnabled(v: boolean) { _audioEnabled = v; }
export function setAudioVolume(v: number) { _audioVolume = Math.max(0, Math.min(1, v)); }

export default function FeedbackSettingsCard() {
  const [sound, setSound] = useState(true);
  const [volume, setVolumeState] = useState(60);
  const [haptics, setHaptics] = useState(true);

  return (
    <div className="game-signal-card">
      <div className="game-signal-card__label">Feedback Ayarları</div>

      <div className="game-settings-row">
        <span>Ses</span>
        <button
          className="game-button game-button--sm"
          onClick={() => {
            const next = !sound;
            setSound(next);
            setAudioEnabled(next);
          }}
        >
          {sound ? 'Açık' : 'Kapalı'}
        </button>
      </div>

      <div className="game-settings-row game-settings-row--col">
        <span className="game-eyebrow">Ses seviyesi</span>
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
          style={{ width: '100%' }}
        />
      </div>

      <div className="game-settings-row">
        <span>Haptic</span>
        <button
          className="game-button game-button--sm"
          onClick={() => setHaptics((v) => !v)}
        >
          {haptics ? 'Açık' : 'Kapalı'}
        </button>
      </div>
    </div>
  );
}
