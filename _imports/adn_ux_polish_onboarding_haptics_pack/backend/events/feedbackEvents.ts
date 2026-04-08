export type FeedbackEvent =
  | "tap"
  | "combo_threshold"
  | "crit"
  | "reward_claim"
  | "level_up"
  | "mission_complete"
  | "chest_drop"
  | "chest_open"
  | "legendary_reveal"
  | "jackpot"
  | "error"
  | "prestige";

export function getFeedbackPriority(event: FeedbackEvent) {
  switch (event) {
    case "jackpot":
    case "prestige":
      return 5;
    case "legendary_reveal":
    case "level_up":
      return 4;
    case "crit":
    case "chest_open":
    case "mission_complete":
      return 3;
    case "combo_threshold":
    case "reward_claim":
      return 2;
    case "tap":
      return 1;
    default:
      return 0;
  }
}
