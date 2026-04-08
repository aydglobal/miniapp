/**
 * ADN Phase 3 — Mission Catalog
 * Tüm görev tanımları. dailyMissionGenerator bu havuzdan seçer.
 */
export type MissionType = "tap" | "upgrade" | "social" | "event" | "economy";
export type MissionDifficulty = "easy" | "medium" | "hard";

export type Mission = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  target: number;
  rewardCoins: number;
  rewardXP: number;
};

export const missionCatalog: Mission[] = [
  // Tap
  { id: "tap_150",     title: "Signal Warmup",    description: "150 kez tap yap",              type: "tap",      difficulty: "easy",   target: 150, rewardCoins: 120,  rewardXP: 20  },
  { id: "tap_600",     title: "Pulse Storm",       description: "600 kez tap yap",              type: "tap",      difficulty: "medium", target: 600, rewardCoins: 420,  rewardXP: 65  },
  // Upgrade
  { id: "buy_2",       title: "First Build",       description: "2 upgrade satın al",           type: "upgrade",  difficulty: "easy",   target: 2,   rewardCoins: 160,  rewardXP: 22  },
  { id: "buy_5",       title: "System Shaper",     description: "5 upgrade satın al",           type: "upgrade",  difficulty: "medium", target: 5,   rewardCoins: 500,  rewardXP: 70  },
  // Social
  { id: "invite_1",    title: "Open the Network",  description: "1 referral getir",             type: "social",   difficulty: "medium", target: 1,   rewardCoins: 800,  rewardXP: 120 },
  // Economy
  { id: "chest_3",     title: "Crack the Vault",   description: "3 chest aç",                  type: "economy",  difficulty: "medium", target: 3,   rewardCoins: 560,  rewardXP: 78  },
  // Event
  { id: "event_score", title: "Event Heat",        description: "eventte hedef puana ulaş",     type: "event",    difficulty: "hard",   target: 1,   rewardCoins: 1200, rewardXP: 170 },
];

/** Zorluk seviyesine göre filtrele */
export function getMissionsByDifficulty(difficulty: MissionDifficulty): Mission[] {
  return missionCatalog.filter((m) => m.difficulty === difficulty);
}

/** Tipe göre filtrele */
export function getMissionsByType(type: MissionType): Mission[] {
  return missionCatalog.filter((m) => m.type === type);
}
