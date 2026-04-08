type SfxKey =
  | "tap"
  | "crit"
  | "level_up"
  | "chest_open"
  | "legendary"
  | "jackpot"
  | "error"
  | "reward";

type AudioConfig = {
  enabled: boolean;
  volume: number;
};

const config: AudioConfig = {
  enabled: true,
  volume: 0.6,
};

let lastPlayed: Record<string, number> = {};

export function setAudioEnabled(enabled: boolean) {
  config.enabled = enabled;
}

export function setAudioVolume(volume: number) {
  config.volume = Math.max(0, Math.min(1, volume));
}

export function playSfx(key: SfxKey) {
  if (!config.enabled) return;

  const now = Date.now();
  if ((lastPlayed[key] || 0) + 70 > now) return;
  lastPlayed[key] = now;

  // Burada gerçek asset bağlanır. Şimdilik placeholder.
  console.log("[SFX]", key, config.volume);
}
