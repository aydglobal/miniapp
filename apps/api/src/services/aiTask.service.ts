export type DynamicTaskContext = {
  segment: 'cold' | 'warm' | 'hot' | 'whale';
  likesReferral: boolean;
  dropsOnHardTasks: boolean;
  purchasedBefore: boolean;
};

export function buildDynamicReferralTask(ctx: DynamicTaskContext) {
  if (ctx.segment === 'cold') {
    return {
      title: '1 arkadas davet et, streak koruma al',
      description: 'Bir arkadas davet et ve yarin streak korumasi kazan.',
      category: 'retention'
    };
  }

  if (ctx.segment === 'whale' || ctx.purchasedBefore) {
    return {
      title: 'Premium referral zinciri tamamla',
      description: 'Premium satin alan referral getir, ozel odul ac.',
      category: 'purchase'
    };
  }

  if (ctx.likesReferral && !ctx.dropsOnHardTasks) {
    return {
      title: '2 aktif referral getir, 24 saatlik boost kazan',
      description: 'Iki aktif referral ile ekstra boost al.',
      category: 'growth'
    };
  }

  return {
    title: '1 referral getir, gunluk odul kazan',
    description: 'Basit bir gorev ile ritme geri don.',
    category: 'easy'
  };
}
