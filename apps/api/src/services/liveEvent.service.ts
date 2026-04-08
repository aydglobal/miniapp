export type EventKey =
  | 'x2_tap_hour'
  | 'referral_rush_weekend'
  | 'lucky_chest_night'
  | 'prestige_week'
  | 'clan_war_sprint';

export function applyEventModifiers(eventKey: EventKey) {
  switch (eventKey) {
    case 'x2_tap_hour':
      return { tapMultiplier: 2 };
    case 'referral_rush_weekend':
      return { referralMultiplier: 1.5 };
    case 'lucky_chest_night':
      return { chestLuckMultiplier: 1.8, jackpotMultiplier: 2 };
    case 'prestige_week':
      return { prestigeCoreMultiplier: 1.5 };
    case 'clan_war_sprint':
      return { clanPointMultiplier: 2 };
  }
}
