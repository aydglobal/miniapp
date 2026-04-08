export function buildProfilePresentation(input: {
  coins: number;
  passiveIncomePerHour: number;
  energy: number;
  energyMax: number;
  hasUnclaimedDaily: boolean;
  chestReady: boolean;
  currentEventName?: string | null;
}) {
  return {
    topCards: [
      { key: "balance", title: "ADN", value: input.coins.toLocaleString() },
      { key: "income", title: "Saatlik", value: `${input.passiveIncomePerHour.toLocaleString()}/s` },
      { key: "energy", title: "Enerji", value: `${input.energy}/${input.energyMax}` },
    ],
    highlights: {
      dailyReady: input.hasUnclaimedDaily,
      chestReady: input.chestReady,
      currentEventName: input.currentEventName ?? null,
    },
  };
}
