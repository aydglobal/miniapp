export function getCampaigns() {
  return [
    {
      key: "return_chest_ready",
      title: "Chest Ready Return Push",
      audienceSegment: "warm",
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      sentCount: 0,
      clickCount: 0,
    },
    {
      key: "referral_rush_push",
      title: "Referral Rush Push",
      audienceSegment: "hot",
      status: "draft",
      scheduledAt: null,
      sentCount: 0,
      clickCount: 0,
    },
  ];
}

export function triggerCampaign(key: string) {
  return { success: true, key, status: "queued" };
}
