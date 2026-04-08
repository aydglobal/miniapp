export function getLiveEvents() {
  return [
    {
      key: "lucky_chest_night",
      title: "Lucky Chest Night",
      isEnabled: true,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      modifiers: { jackpotMultiplier: 2, chestLuckMultiplier: 1.5 },
    },
    {
      key: "referral_rush_weekend",
      title: "Referral Rush Weekend",
      isEnabled: false,
      startsAt: null,
      endsAt: null,
      modifiers: { referralMultiplier: 1.5 },
    },
  ];
}

export function startLiveEvent(eventKey: string) {
  return { success: true, eventKey };
}

export function stopLiveEvent(eventKey: string) {
  return { success: true, eventKey };
}
