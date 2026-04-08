import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  generateDailyMissions,
  type MissionInstance,
  type MissionMetric,
  type MissionReward
} from './dailyMissionGenerator';
import {
  archiveClaim,
  createEmptyMissionPersistence,
  isMissionExpired,
  loadMissionPersistence,
  saveMissionPersistence,
  type MissionPersistenceState,
  type MissionStatSnapshot
} from './missionPersistence';

export type MissionEngineInput = {
  level: number;
  prestige: number;
  vipLevel: number;
  eventActive?: boolean;
  stats: MissionStatSnapshot;
};

export type MissionRewardPatch = {
  coins: number;
  gems: number;
  keys: number;
  boosts: Array<NonNullable<MissionReward['boost']>>;
};

const metricMap: Record<MissionMetric, keyof MissionStatSnapshot> = {
  taps: 'taps',
  coinsEarned: 'coinsEarned',
  comboBest: 'comboBest',
  criticalHits: 'criticalHits',
  upgradesBought: 'upgradesBought',
  chestsOpened: 'chestsOpened',
  idleCollected: 'idleCollected',
  premiumSpent: 'premiumSpent',
  prestigeCount: 'prestigeCount',
  referrals: 'referrals'
};

function buildRewardPatch(reward: MissionReward): MissionRewardPatch {
  return {
    coins: reward.coins ?? 0,
    gems: reward.gems ?? 0,
    keys: reward.keys ?? 0,
    boosts: reward.boost ? [reward.boost] : []
  };
}

function syncMissionProgress(missions: MissionInstance[], stats: MissionStatSnapshot) {
  return missions.map((mission) => {
    const metricKey = metricMap[mission.metric];
    const progress = Math.min(stats[metricKey], mission.target);
    return {
      ...mission,
      progress
    };
  });
}

function refreshDailyIfNeeded(
  prevState: MissionPersistenceState,
  input: MissionEngineInput,
  now = Date.now()
): MissionPersistenceState {
  const existingDaily = prevState.activeDaily.filter((mission) => !isMissionExpired(mission, now));
  if (existingDaily.length >= 3) {
    return {
      ...prevState,
      activeDaily: syncMissionProgress(existingDaily, input.stats)
    };
  }

  const regenerated = generateDailyMissions({
    level: input.level,
    prestige: input.prestige,
    vipLevel: input.vipLevel,
    eventActive: input.eventActive,
    existingMissionKeys: existingDaily.map((mission) => mission.key),
    now
  });

  return {
    ...prevState,
    activeDaily: syncMissionProgress(regenerated, input.stats),
    statsSnapshot: input.stats,
    lastGeneratedAt: now
  };
}

export function useMissionEngine(input: MissionEngineInput) {
  const [state, setState] = useState<MissionPersistenceState>(() => loadMissionPersistence());

  useEffect(() => {
    setState((prev) => refreshDailyIfNeeded(prev, input));
  }, [input.level, input.prestige, input.vipLevel, input.eventActive, input.stats]);

  useEffect(() => {
    saveMissionPersistence(state);
  }, [state]);

  const claimMission = useCallback((missionId: string) => {
    let rewardPatch: MissionRewardPatch | null = null;

    setState((prev) => {
      const nextDaily = prev.activeDaily.map((mission) => {
        if (mission.id !== missionId) return mission;
        if (mission.claimed || mission.progress < mission.target) return mission;
        rewardPatch = buildRewardPatch(mission.reward);
        return {
          ...mission,
          claimed: true
        };
      });

      const claimedMission = nextDaily.find((mission) => mission.id === missionId && mission.claimed);
      const nextState = {
        ...prev,
        activeDaily: nextDaily
      };

      return claimedMission ? archiveClaim(nextState, claimedMission) : nextState;
    });

    return rewardPatch;
  }, []);

  const resetMissions = useCallback(() => {
    setState(createEmptyMissionPersistence());
  }, []);

  const activeDaily = useMemo(() => syncMissionProgress(state.activeDaily, input.stats), [state.activeDaily, input.stats]);
  const completedCount = activeDaily.filter((mission) => mission.progress >= mission.target).length;
  const claimedCount = activeDaily.filter((mission) => mission.claimed).length;

  return {
    state,
    activeDaily,
    completedCount,
    claimedCount,
    claimMission,
    resetMissions
  };
}
