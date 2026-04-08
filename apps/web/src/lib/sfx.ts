let audioContext: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    audioContext = new AudioCtor();
  }
  // Tarayıcı politikası nedeniyle suspended olabilir — kullanıcı etkileşiminde resume et
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => null);
  }
  return audioContext;
}

function tone(
  frequency: number,
  durationMs: number,
  gainValue: number,
  type: OscillatorType,
  when = 0
) {
  const context = ctx();
  if (!context || context.state === 'suspended') return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, context.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(gainValue, context.currentTime + when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + when + durationMs / 1000);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(context.currentTime + when);
  oscillator.stop(context.currentTime + when + durationMs / 1000 + 0.02);
}

export function playSoftClick() {
  tone(440, 70, 0.02, 'triangle');
  tone(620, 45, 0.012, 'sine', 0.015);
}

export function playSuccessTone() {
  tone(520, 110, 0.026, 'triangle');
  tone(780, 180, 0.016, 'sine', 0.045);
}

export function playUpgradeTone() {
  tone(420, 90, 0.024, 'square');
  tone(640, 120, 0.018, 'triangle', 0.04);
  tone(880, 180, 0.014, 'sine', 0.08);
}
