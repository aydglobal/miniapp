export function canPrestige(params: {
  level: number;
  passiveIncomePerHour: number;
  totalLifetimeEarned: number;
}) {
  return (
    params.level >= 20 &&
    params.passiveIncomePerHour >= 5000 &&
    params.totalLifetimeEarned >= 250000
  );
}

export function computePrestigeRewards(totalLifetimeEarned: number) {
  const prestigePower = Math.floor(Math.sqrt(totalLifetimeEarned / 100000));
  return {
    prestigePower,
    nebulaCoreGranted: 3 + prestigePower,
  };
}

export function getPermanentBonus(metaLevels: {
  tapMastery: number;
  critLab: number;
  energyReactor: number;
  offlineVault: number;
  clanHonor: number;
}) {
  return {
    tapMultiplier: 1 + metaLevels.tapMastery * 0.02,
    critChanceBonus: metaLevels.critLab * 0.004,
    energyBonus: metaLevels.energyReactor * 0.03,
    offlineCapBonus: metaLevels.offlineVault * 0.05,
    clanContributionBonus: metaLevels.clanHonor * 0.04,
  };
}
