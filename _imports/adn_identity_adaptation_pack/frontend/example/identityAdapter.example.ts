import { identityCopy } from "../copy/identityCopy";
import { screenLabels } from "../copy/screenLabels";

export function adaptProfileUi(profile: {
  level: number;
  coins: number;
  passiveIncomePerHour: number;
}) {
  const phase =
    profile.level >= 61
      ? identityCopy.phases.nebula_lord
      : profile.level >= 36
      ? identityCopy.phases.empire
      : profile.level >= 19
      ? identityCopy.phases.operation
      : profile.level >= 8
      ? identityCopy.phases.setup
      : identityCopy.phases.street;

  return {
    heroTitle: identityCopy.slogan,
    phaseLabel: `${screenLabels.home.phase}: ${phase}`,
    balanceLabel: `${screenLabels.home.totalAdn}: ${profile.coins.toLocaleString()}`,
    flowLabel: `${screenLabels.home.hourlyFlow}: ${profile.passiveIncomePerHour.toLocaleString()}/s`,
  };
}
