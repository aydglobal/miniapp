export function restoreEnergy(params: {
  currentEnergy: number;
  lastEnergyAt: Date;
  energyMax: number;
  regenPerMinute: number;
}) {
  const { currentEnergy, lastEnergyAt, energyMax, regenPerMinute } = params;

  // Zaten max ise hesaplama yapma
  if (currentEnergy >= energyMax) {
    return { energy: energyMax, lastEnergyAt };
  }

  const now = new Date();
  const minutesPassed = Math.max(
    0,
    Math.floor((now.getTime() - new Date(lastEnergyAt).getTime()) / 60000)
  );

  if (minutesPassed <= 0) {
    return {
      energy: Math.min(currentEnergy, energyMax),
      lastEnergyAt
    };
  }

  const restored = minutesPassed * regenPerMinute;
  const newEnergy = Math.min(currentEnergy + restored, energyMax);

  return {
    energy: newEnergy,
    // lastEnergyAt'i sadece gerçekten enerji restore edildiyse güncelle
    lastEnergyAt: restored > 0 ? now : lastEnergyAt
  };
}
