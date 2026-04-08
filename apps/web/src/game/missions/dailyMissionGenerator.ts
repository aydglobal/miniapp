export type MissionCategory = 'daily' | 'weekly' | 'story' | 'side' | 'milestone' | 'event' | 'vip' | 'social';
export type MissionMetric =
  | 'taps'
  | 'coinsEarned'
  | 'comboBest'
  | 'criticalHits'
  | 'upgradesBought'
  | 'chestsOpened'
  | 'idleCollected'
  | 'premiumSpent'
  | 'prestigeCount'
  | 'referrals';

export type MissionReward = {
  coins?: number;
  gems?: number;
  keys?: number;
  boost?: {
    type: 'tap' | 'combo' | 'crit' | 'idle';
    multiplier: number;
    durationMinutes: number;
  };
};

export type MissionDefinition = {
  id: string;
  key: string;
  title: string;
  description: string;
  category: MissionCategory;
  metric: MissionMetric;
  target: number;
  minLevel: number;
  maxLevel?: number;
  reward: MissionReward;
  weight?: number;
  tags?: string[];
};

export type MissionInstance = MissionDefinition & {
  seed: string;
  generatedAt: number;
  expiresAt?: number;
  progress: number;
  claimed: boolean;
};

export type DailyMissionGeneratorInput = {
  level: number;
  prestige: number;
  vipLevel: number;
  eventActive?: boolean;
  existingMissionKeys?: string[];
  now?: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const missionPool: MissionDefinition[] = [
  {
    id: 'daily_taps_bronze',
    key: 'daily_taps_bronze',
    title: 'Hızlı Parmak',
    description: 'Bugün belirlenen tap hedefini tamamla.',
    category: 'daily',
    metric: 'taps',
    target: 120,
    minLevel: 1,
    maxLevel: 8,
    reward: { coins: 500, boost: { type: 'tap', multiplier: 1.5, durationMinutes: 8 } },
    weight: 10,
    tags: ['tap', 'starter']
  },
  {
    id: 'daily_taps_silver',
    key: 'daily_taps_silver',
    title: 'Tempo Kurucu',
    description: 'Bugün yüksek tempoda tap serisi tamamla.',
    category: 'daily',
    metric: 'taps',
    target: 450,
    minLevel: 9,
    maxLevel: 24,
    reward: { coins: 2400, gems: 1 },
    weight: 9,
    tags: ['tap']
  },
  {
    id: 'daily_taps_gold',
    key: 'daily_taps_gold',
    title: 'Empire Ritmi',
    description: 'Bugünün elit tap görevini tamamla.',
    category: 'daily',
    metric: 'taps',
    target: 1200,
    minLevel: 25,
    reward: { coins: 12500, gems: 3, keys: 1 },
    weight: 8,
    tags: ['tap', 'late']
  },
  {
    id: 'daily_earn_bronze',
    key: 'daily_earn_bronze',
    title: 'Günün İlk Kârı',
    description: 'Bugün belirli miktarda ADN kazan.',
    category: 'daily',
    metric: 'coinsEarned',
    target: 2500,
    minLevel: 1,
    maxLevel: 10,
    reward: { coins: 900, gems: 1 },
    weight: 10,
    tags: ['earn', 'starter']
  },
  {
    id: 'daily_earn_mid',
    key: 'daily_earn_mid',
    title: 'Kasayı Şişir',
    description: 'Bugün orta seviye bir servet hedefi tamamla.',
    category: 'daily',
    metric: 'coinsEarned',
    target: 45000,
    minLevel: 11,
    maxLevel: 35,
    reward: { coins: 10000, gems: 2, keys: 1 },
    weight: 9,
    tags: ['earn']
  },
  {
    id: 'daily_earn_elite',
    key: 'daily_earn_elite',
    title: 'Whale Geliri',
    description: 'Bugün elit seviyede ADN üret.',
    category: 'daily',
    metric: 'coinsEarned',
    target: 350000,
    minLevel: 36,
    reward: { coins: 90000, gems: 4, keys: 2 },
    weight: 7,
    tags: ['earn', 'late']
  },
  {
    id: 'daily_combo_chain',
    key: 'daily_combo_chain',
    title: 'Zinciri Kırma',
    description: 'Bugün belirlenen combo seviyesine ulaş.',
    category: 'daily',
    metric: 'comboBest',
    target: 18,
    minLevel: 5,
    maxLevel: 30,
    reward: { coins: 3500, boost: { type: 'combo', multiplier: 2, durationMinutes: 10 } },
    weight: 8,
    tags: ['combo']
  },
  {
    id: 'daily_combo_late',
    key: 'daily_combo_late',
    title: 'Sarsılmaz Zincir',
    description: 'Bugün üst seviye combo zirvesine çık.',
    category: 'daily',
    metric: 'comboBest',
    target: 40,
    minLevel: 31,
    reward: { coins: 22000, gems: 3 },
    weight: 6,
    tags: ['combo', 'late']
  },
  {
    id: 'daily_crit_hunt',
    key: 'daily_crit_hunt',
    title: 'Kritik Avcısı',
    description: 'Bugün kritik vuruş topla.',
    category: 'daily',
    metric: 'criticalHits',
    target: 6,
    minLevel: 8,
    maxLevel: 32,
    reward: { coins: 5000, boost: { type: 'crit', multiplier: 1.75, durationMinutes: 12 } },
    weight: 7,
    tags: ['crit']
  },
  {
    id: 'daily_upgrades',
    key: 'daily_upgrades',
    title: 'Atölye Açık',
    description: 'Bugün belirli sayıda upgrade satın al.',
    category: 'daily',
    metric: 'upgradesBought',
    target: 4,
    minLevel: 4,
    reward: { coins: 2800, gems: 1, keys: 1 },
    weight: 8,
    tags: ['upgrade']
  },
  {
    id: 'daily_chests',
    key: 'daily_chests',
    title: 'Kasa Operasyonu',
    description: 'Bugün chest aç ve ödül zincirini tetikle.',
    category: 'daily',
    metric: 'chestsOpened',
    target: 2,
    minLevel: 6,
    reward: { coins: 4000, keys: 1 },
    weight: 7,
    tags: ['chest']
  },
  {
    id: 'daily_idle',
    key: 'daily_idle',
    title: 'Pasif Makine',
    description: 'Idle gelirden ADN topla.',
    category: 'daily',
    metric: 'idleCollected',
    target: 18000,
    minLevel: 14,
    reward: { coins: 6500, gems: 2 },
    weight: 6,
    tags: ['idle']
  },
  {
    id: 'daily_premium',
    key: 'daily_premium',
    title: 'VIP Akışı',
    description: 'Premium ekonomide bir hamle yap.',
    category: 'daily',
    metric: 'premiumSpent',
    target: 1,
    minLevel: 20,
    reward: { coins: 12000, gems: 4, keys: 1 },
    weight: 3,
    tags: ['vip']
  }
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string) {
  let h = 1779033703;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function getDailySeed(level: number, prestige: number, vipLevel: number, dayStart: number) {
  return `${level}:${prestige}:${vipLevel}:${dayStart}`;
}

function dayStartFor(now: number) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function isEligible(mission: MissionDefinition, level: number, vipLevel: number) {
  if (level < mission.minLevel) return false;
  if (typeof mission.maxLevel === 'number' && level > mission.maxLevel) return false;
  if (mission.tags?.includes('vip') && vipLevel <= 0) return false;
  return true;
}

function weightedPick<T extends { weight?: number }>(items: T[], random: () => number) {
  const total = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let roll = random() * total;
  for (const item of items) {
    roll -= item.weight ?? 1;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function scaleTarget(base: number, level: number, prestige: number) {
  const levelScale = 1 + level * 0.055;
  const prestigeScale = 1 + prestige * 0.085;
  return Math.max(1, Math.round(base * levelScale * prestigeScale));
}

function scaleReward(reward: MissionReward, level: number, prestige: number, vipLevel: number): MissionReward {
  const mult = 1 + level * 0.06 + prestige * 0.12 + vipLevel * 0.08;
  return {
    coins: reward.coins ? Math.round(reward.coins * mult) : undefined,
    gems: reward.gems ? Math.max(1, Math.round(reward.gems + level / 25 + prestige / 4)) : undefined,
    keys: reward.keys ? Math.max(1, Math.round(reward.keys + level / 40)) : undefined,
    boost: reward.boost
      ? {
          ...reward.boost,
          multiplier: Number((reward.boost.multiplier + level * 0.015 + prestige * 0.03).toFixed(2))
        }
      : undefined
  };
}

function avoidDuplicateTag(candidate: MissionDefinition, chosen: MissionDefinition[]) {
  const candidateTags = new Set(candidate.tags ?? []);
  const overlapping = chosen.some((item) => (item.tags ?? []).some((tag) => candidateTags.has(tag)));
  return !overlapping;
}

export function generateDailyMissions(input: DailyMissionGeneratorInput): MissionInstance[] {
  const now = input.now ?? Date.now();
  const start = dayStartFor(now);
  const seed = getDailySeed(input.level, input.prestige, input.vipLevel, start);
  const random = mulberry32(hashString(seed));

  const eligible = missionPool.filter((mission) => isEligible(mission, input.level, input.vipLevel));
  const preferredCount = input.level < 10 ? 3 : input.level < 35 ? 4 : 5;
  const chosen: MissionDefinition[] = [];
  const blockedKeys = new Set(input.existingMissionKeys ?? []);

  while (chosen.length < preferredCount && chosen.length < eligible.length) {
    const candidates = eligible.filter(
      (mission) => !blockedKeys.has(mission.key) && !chosen.some((item) => item.key === mission.key)
    );
    if (!candidates.length) break;

    const filtered = candidates.filter((item) => avoidDuplicateTag(item, chosen));
    const source = filtered.length ? filtered : candidates;
    const picked = weightedPick(source, random);
    chosen.push(picked);
  }

  if (input.eventActive && input.level >= 12) {
    chosen.push({
      id: 'event_daily_flash',
      key: 'event_daily_flash',
      title: 'Event Baskını',
      description: 'Aktif event süresince bonus üretim yap.',
      category: 'event',
      metric: 'coinsEarned',
      target: scaleTarget(22000, input.level, input.prestige),
      minLevel: 12,
      reward: scaleReward({ coins: 12000, gems: 2, keys: 1 }, input.level, input.prestige, input.vipLevel),
      weight: 1,
      tags: ['event']
    });
  }

  return chosen.map((mission, index) => ({
    ...mission,
    id: `${mission.id}:${start}:${index}`,
    seed,
    generatedAt: now,
    expiresAt: start + DAY_MS,
    target: scaleTarget(mission.target, input.level, input.prestige),
    reward: scaleReward(mission.reward, input.level, input.prestige, input.vipLevel),
    progress: 0,
    claimed: false
  }));
}
