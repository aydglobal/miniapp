type Campaign = {
  key: string;
  title: string;
  audienceSegment: string;
  status: 'idle' | 'triggered';
  body: string;
  lastTriggeredAt: string | null;
};

const campaigns: Campaign[] = [
  {
    key: 'daily_reclaim',
    title: 'Daily Reclaim Pulse',
    audienceSegment: 'daily_users',
    status: 'idle',
    body: 'Gunluk ADN akisin hazir. Seriyi bozma.',
    lastTriggeredAt: null
  },
  {
    key: 'idle_vault_full',
    title: 'Idle Vault Recall',
    audienceSegment: 'idle_lovers',
    status: 'idle',
    body: 'Offline kasan doldu. Geri donup ADN topla.',
    lastTriggeredAt: null
  },
  {
    key: 'reboot_ready',
    title: 'Reboot Ready Call',
    audienceSegment: 'empire',
    status: 'idle',
    body: 'Reboot Reactor hazir. Kalici guce gecme zamani.',
    lastTriggeredAt: null
  }
];

export function getCampaigns() {
  return structuredClone(campaigns);
}

export function triggerCampaign(key: string) {
  const campaign = campaigns.find((item) => item.key === key);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  campaign.status = 'triggered';
  campaign.lastTriggeredAt = new Date().toISOString();

  return {
    success: true,
    campaign
  };
}
