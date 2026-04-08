export type AppIconName =
  | 'tap'
  | 'energy'
  | 'coin'
  | 'wallet'
  | 'referral'
  | 'leaderboard'
  | 'shop'
  | 'boost'
  | 'shield'
  | 'play'
  | 'pause'
  | 'lock'
  | 'chart'
  | 'rocket'
  | 'target'
  | 'gift'
  | 'star'
  | 'crown'
  | 'mining'
  | 'lightning'
  | 'pulse'
  | 'radar'
  | 'bell'
  | 'ticket'
  | 'trophy'
  | 'home'
  | 'user'
  | 'settings'
  | 'clock'
  | 'check'
  | 'close'
  | 'fire'
  | 'spark'
  | 'wave'
  | 'grid'
  | 'gem'
  | 'cube'
  | 'link'
  | 'filter'
  | 'arrowup';

const icons: Record<AppIconName, string> = {
  tap: 'M12 3 8 11h4l-1 10 5-9h-4l1-12Z',
  energy: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  coin: 'M12 4c4.4 0 8 1.8 8 4s-3.6 4-8 4-8-1.8-8-4 3.6-4 8-4Zm-8 8v4c0 2.2 3.6 4 8 4s8-1.8 8-4v-4',
  wallet: 'M4 8h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Zm0 0V6a2 2 0 0 1 2-2h11',
  referral: 'M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 12v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2m18-9 4 4m0-4-4 4m-2-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  leaderboard: 'M5 20V10m7 10V4m7 16v-7',
  shop: 'M4 7h16l-1.6 11.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 7Zm3-3h10l1 3H6l1-3Z',
  boost: 'M12 2 15 8l7 1-5 5 1 8-7-4-7 4 1-8-5-5 7-1 3-6Z',
  shield: 'M12 3 5 6v5c0 5 3.4 8.8 7 10 3.6-1.2 7-5 7-10V6l-7-3Z',
  play: 'M8 6v12l10-6-10-6Z',
  pause: 'M8 5h3v14H8zm5 0h3v14h-3z',
  lock: 'M7 10V8a5 5 0 0 1 10 0v2m-9 0h8a2 2 0 0 1 2 2v7H6v-7a2 2 0 0 1 2-2Z',
  chart: 'M4 19h16M7 15l3-4 3 2 4-6',
  rocket: 'M13 3c3 0 6 3 6 6-2 2-4 4-7 5l-3 4-1-5-5-1 4-3c1-3 3-6 6-6Zm4 4h.01',
  target: 'M12 4a8 8 0 1 0 8 8m-8-4a4 4 0 1 0 4 4m0-8v4h4',
  gift: 'M20 12v8H4v-8m18 0H2m10 0V4m0 8h8M4 12h8M8.5 6.5A2.5 2.5 0 1 1 12 9c0-1.38-1.12-2.5-2.5-2.5Zm7 0A2.5 2.5 0 1 0 12 9c0-1.38 1.12-2.5 2.5-2.5Z',
  star: 'M12 3.5 14.9 9l6 .9-4.4 4.3 1 6-5.5-2.9-5.5 2.9 1-6L3.1 9.9l6-.9L12 3.5Z',
  crown: 'M4 18 6 7l6 5 6-5 2 11H4Z',
  mining: 'M4 18h16M8 18l4-7 4 7M12 3v4',
  lightning: 'M11 2 5 13h5l-1 9 7-11h-5l1-9Z',
  pulse: 'M3 12h4l2-4 4 8 2-4h6',
  radar: 'M12 12 18 6m-6 6a8 8 0 1 1 5.7-2.3M12 12l4 4',
  bell: 'M12 3a4 4 0 0 1 4 4v2c0 1.2.4 2.3 1.1 3.2L19 14H5l1.9-1.8A4.8 4.8 0 0 0 8 9V7a4 4 0 0 1 4-4Zm-2 14a2 2 0 0 0 4 0',
  ticket: 'M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z',
  trophy: 'M7 4h10v3a5 5 0 0 1-10 0V4Zm-2 1H3v2a4 4 0 0 0 4 4m10-6h2v2a4 4 0 0 1-4 4m-5 4v3m-3 3h10',
  home: 'M4 10 12 4l8 6v10H4V10Zm6 10v-6h4v6',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9v-1a7 7 0 0 1 14 0v1',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4 .9 2.3-2 1.1-.2 2.4-2.3.3-1.2 2-2.2-.8L12 22l-2-1.7-2.2.8-1.2-2-2.3-.3-.2-2.4-2-1.1L4 12 3.1 9.7l2-1.1.2-2.4 2.3-.3 1.2-2 2.2.8L12 2l2 1.7 2.2-.8 1.2 2 2.3.3.2 2.4 2 1.1L20 12Z',
  clock: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4v5l4 2',
  check: 'm5 12 4 4 10-10',
  close: 'M6 6l12 12M18 6 6 18',
  fire: 'M12 3s4 3 4 7a4 4 0 0 1-8 0c0-2 1-3.5 4-7Zm0 9a3 3 0 0 1 3 3 3 3 0 1 1-6 0c0-1.5 1-3 3-3Z',
  spark: 'M12 2v4m0 12v4M4 12H0m24 0h-4M5 5l2.5 2.5M19 19l-2.5-2.5M19 5l-2.5 2.5M5 19l2.5-2.5',
  wave: 'M2 14c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4 2-4 4-4',
  grid: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  gem: 'M6 8 9 4h6l3 4-6 12-6-12Z',
  cube: 'M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 0v10m8-6-8 6-8-6',
  link: 'M10 14 8 16a4 4 0 1 1-6-6l2-2m10 2 2-2a4 4 0 1 1 6 6l-2 2m-8-8 4 4',
  filter: 'M4 5h16l-6 7v6l-4 1v-7L4 5Z',
  arrowup: 'M12 19V5m0 0-5 5m5-5 5 5'
};

export const appIconNames = Object.keys(icons) as AppIconName[];

export function AppIcon({
  name,
  size = 18,
  stroke = 'currentColor',
  strokeWidth = 2.35
}: {
  name: AppIconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[name]} />
    </svg>
  );
}
