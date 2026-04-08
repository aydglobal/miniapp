import type { MissionInstance } from './dailyMissionGenerator';

export type MissionStatSnapshot = {
  taps: number;
  coinsEarned: number;
  comboBest: number;
  criticalHits: number;
  upgradesBought: number;
  chestsOpened: number;
  idleCollected: number;
  premiumSpent: number;
  prestigeCount: number;
  referrals: number;
};

export type MissionArchiveItem = {
  id: string;
  title: string;
  category: string;
  claimedAt: number;
  rewardSummary: string;
};

export type MissionPersistenceState = {
  version: number;
  activeDaily: MissionInstance[];
  activeWeekly: MissionInstance[];
  storyChainCompleted: string[];
  archivedClaims: MissionArchiveItem[];
  statsSnapshot: MissionStatSnapshot;
  lastGeneratedAt: number;
};

const VERSION = 1;
const STORAGE_KEY = 'adn-mission-system-v1';

export function createEmptyMissionPersistence(): MissionPersistenceState {
  return {
    version: VERSION,
    activeDaily: [],
    activeWeekly: [],
    storyChainCompleted: [],
    archivedClaims: [],
    statsSnapshot: {
      taps: 0,
      coinsEarned: 0,
      comboBest: 0,
      criticalHits: 0,
      upgradesBought: 0,
      chestsOpened: 0,
      idleCollected: 0,
      premiumSpent: 0,
      prestigeCount: 0,
      referrals: 0
    },
    lastGeneratedAt: 0
  };
}

export function loadMissionPersistence(storageKey = STORAGE_KEY): MissionPersistenceState {
  if (typeof window === 'undefined') return createEmptyMissionPersistence();

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return createEmptyMissionPersistence();

  try {
    const parsed = JSON.parse(raw) as Partial<MissionPersistenceState>;
    const base = createEmptyMissionPersistence();

    return {
      ...base,
      ...parsed,
      activeDaily: Array.isArray(parsed.activeDaily) ? parsed.activeDaily : base.activeDaily,
      activeWeekly: Array.isArray(parsed.activeWeekly) ? parsed.activeWeekly : base.activeWeekly,
      storyChainCompleted: Array.isArray(parsed.storyChainCompleted)
        ? parsed.storyChainCompleted
        : base.storyChainCompleted,
      archivedClaims: Array.isArray(parsed.archivedClaims) ? parsed.archivedClaims : base.archivedClaims,
      statsSnapshot: {
        ...base.statsSnapshot,
        ...(parsed.statsSnapshot ?? {})
      }
    };
  } catch {
    return createEmptyMissionPersistence();
  }
}

export function saveMissionPersistence(state: MissionPersistenceState, storageKey = STORAGE_KEY) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function clearMissionPersistence(storageKey = STORAGE_KEY) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey);
}

export function missionRewardSummary(mission: MissionInstance) {
  const parts: string[] = [];
  if (mission.reward.coins) parts.push(`${mission.reward.coins} ADN`);
  if (mission.reward.gems) parts.push(`${mission.reward.gems} Gem`);
  if (mission.reward.keys) parts.push(`${mission.reward.keys} Key`);
  if (mission.reward.boost) {
    parts.push(`${mission.reward.boost.type} x${mission.reward.boost.multiplier}`);
  }
  return parts.join(' · ') || 'Reward';
}

export function archiveClaim(state: MissionPersistenceState, mission: MissionInstance): MissionPersistenceState {
  const nextArchive: MissionArchiveItem = {
    id: mission.id,
    title: mission.title,
    category: mission.category,
    claimedAt: Date.now(),
    rewardSummary: missionRewardSummary(mission)
  };

  return {
    ...state,
    archivedClaims: [nextArchive, ...state.archivedClaims].slice(0, 40)
  };
}

export function isMissionExpired(mission: MissionInstance, now = Date.now()) {
  return typeof mission.expiresAt === 'number' ? mission.expiresAt <= now : false;
}
