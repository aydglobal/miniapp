export type OnboardingStep =
  | "welcome"
  | "tap_once"
  | "open_shop"
  | "buy_upgrade"
  | "open_missions"
  | "open_referral"
  | "finish";

export function getNextOnboardingStep(progress: {
  tapped: boolean;
  openedShop: boolean;
  boughtUpgrade: boolean;
  openedMissions: boolean;
  openedReferral: boolean;
}) : OnboardingStep {
  if (!progress.tapped) return "tap_once";
  if (!progress.openedShop) return "open_shop";
  if (!progress.boughtUpgrade) return "buy_upgrade";
  if (!progress.openedMissions) return "open_missions";
  if (!progress.openedReferral) return "open_referral";
  return "finish";
}

export function getOnboardingReward() {
  return {
    adn: 250,
    boostMinutes: 15,
    freeChest: 1,
  };
}
