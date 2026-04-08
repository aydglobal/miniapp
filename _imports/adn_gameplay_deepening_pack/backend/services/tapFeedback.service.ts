export type TapResolution = {
  reward: number;
  isCrit: boolean;
  critMultiplier: number;
  comboHits: number;
  comboMultiplier: number;
  chestDrop: boolean;
};

export function resolveTap(params: {
  baseReward: number;
  critChance: number;
  critMultiplier: number;
  comboHits: number;
  comboMultiplier: number;
  chestChance: number;
}) : TapResolution {
  const isCrit = Math.random() < params.critChance;
  const chestDrop = Math.random() < params.chestChance;
  const reward = Math.floor(
    params.baseReward *
    params.comboMultiplier *
    (isCrit ? params.critMultiplier : 1)
  );

  return {
    reward,
    isCrit,
    critMultiplier: isCrit ? params.critMultiplier : 1,
    comboHits: params.comboHits,
    comboMultiplier: params.comboMultiplier,
    chestDrop,
  };
}

export function getComboMultiplier(comboHits: number) {
  if (comboHits >= 50) return 2.2;
  if (comboHits >= 30) return 1.7;
  if (comboHits >= 15) return 1.35;
  if (comboHits >= 5) return 1.15;
  return 1;
}
