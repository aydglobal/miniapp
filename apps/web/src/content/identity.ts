export const identity = {
  themeName: 'ADN: Zero to Empire',
  slogan: 'Start with nothing. Own everything.',
  subtitle: 'Sistemi kur, agini buyut, ADN akisini kontrol et.',
  home: {
    smartActionTitle: 'Simdi en iyi hamle',
    phaseLabel: 'Bulundugun Faz',
    hourlyLabel: 'Saatlik Akis',
    balanceLabel: 'Toplam ADN',
    energyLabel: 'Enerji'
  },
  tabs: {
    mine: 'Uretim',
    boosts: 'Pazar',
    tasks: 'Operasyon',
    wallet: 'Reboot',
    social: 'Ag'
  },
  rename: {
    leaderboard: 'Guc Siralamasi',
    missions: 'Operasyonlar',
    referral: 'Ag Genisletme',
    chest: 'Cache Vault',
    prestige: 'Reboot Reactor',
    clan: 'Syndicate'
  }
} as const;

export const phaseProgression = [
  {
    key: 'street',
    name: 'Sokak',
    minLevel: 1,
    maxLevel: 7,
    theme: 'Ilk ADN akislarini kendi elinle aciyorsun.',
    tone: 'Ham enerji ve kucuk ama hizli kazanclar.'
  },
  {
    key: 'setup',
    name: 'Kurulum',
    minLevel: 8,
    maxLevel: 18,
    theme: 'Ilk moduller, ilk otomasyon ve ilk ciddi ivme.',
    tone: 'Duzen kurmaya basliyor, akisin netlesiyor.'
  },
  {
    key: 'operation',
    name: 'Operasyon',
    minLevel: 19,
    maxLevel: 35,
    theme: 'Pazar, gorevler ve ag buyumesi birlikte calisiyor.',
    tone: 'Artik tek tek degil, sistem gibi oynuyorsun.'
  },
  {
    key: 'empire',
    name: 'Imparatorluk',
    minLevel: 36,
    maxLevel: 60,
    theme: 'Reboot, event ve meta guc katmanlari acik.',
    tone: 'Kazanan degil, yoneten tarafa geciyorsun.'
  },
  {
    key: 'nebula_lord',
    name: 'Nebula Lord',
    minLevel: 61,
    maxLevel: 999,
    theme: 'Butun ekonomi senin etrafinda sekilleniyor.',
    tone: 'Endgame kontrolu ve buyuk hakimiyet.'
  }
] as const;

export function resolvePhase(level: number) {
  return phaseProgression.find((phase) => level >= phase.minLevel && level <= phase.maxLevel) ?? phaseProgression[0];
}

export function getSmartAction(input: {
  readyChests: number;
  canClaimDaily: boolean;
  canPrestige: boolean;
  onboardingOpen: boolean;
  activeOffer?: string | null;
  nextFeature?: string | null;
}) {
  if (input.readyChests > 0) {
    return {
      title: 'Cache ac',
      body: `${input.readyChests} hazir cache seni bekliyor. Buyuk sicrama sansini kacirma.`
    };
  }

  if (input.canPrestige) {
    return {
      title: 'Reboot kilidi acik',
      body: 'Bugunku gucunu sifirlayip kalici cekirdek avantaji acabilirsin.'
    };
  }

  if (input.canClaimDaily) {
    return {
      title: 'Gunluk akisi topla',
      body: 'Seriyi koru, gunluk ADN akisini kacirma.'
    };
  }

  if (input.onboardingOpen) {
    return {
      title: 'Launch checklist tamamla',
      body: 'Ilk operasyon adimlarini bitir, sistem daha hizli acilsin.'
    };
  }

  if (input.activeOffer) {
    return {
      title: 'Teklifi kullan',
      body: input.activeOffer
    };
  }

  return {
    title: 'Bir sonraki acilimi zorla',
    body: input.nextFeature ? `${input.nextFeature} icin biraz daha ADN biriktir.` : 'Ritmi koru, sistem buyudukce yeni katmanlar acilacak.'
  };
}
