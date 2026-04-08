type Step =
  | 'welcome'
  | 'tap_once'
  | 'open_shop'
  | 'buy_upgrade'
  | 'open_missions'
  | 'open_referral'
  | 'finish';

const copy: Record<Exclude<Step, 'finish'>, { title: string; body: string; cta: string }> = {
  welcome: {
    title: "ADN Arena'ya hos geldin",
    body: "Tap yap, kartlarini gelistir, gorev tamamla ve snapshot oncesi gucunu buyut.",
    cta: 'Baslat'
  },
  tap_once: {
    title: 'Ilk tap',
    body: "Her tap ADN ve XP kazandirir. Crit ve combo ile daha hizli buyursun.",
    cta: 'Anladim'
  },
  open_shop: {
    title: 'Market',
    body: 'Kart gelistirerek saatlik ADN uretimini artirirsin. Uzun vadede asil guc burada.',
    cta: 'Devam'
  },
  buy_upgrade: {
    title: 'Ilk modulu kur',
    body: "Ilk upgrade'i almak erken oyunu hizlandirir. Sonraki gorevleri de kolaylastirir.",
    cta: 'Tamam'
  },
  open_missions: {
    title: 'Gorevler',
    body: 'Gorevler ADN, cache ve boost verir. Ilk gun en hizli ilerleme buradan gelir.',
    cta: 'Gordum'
  },
  open_referral: {
    title: 'Kaliteli referral getir',
    body: 'Sadece aktif oyuncular sayilir. Guclu referral zinciri seni eventlerde one tasir.',
    cta: 'Bitir'
  }
};

export default function OnboardingOverlay({
  step,
  onNext
}: {
  step: Step;
  onNext: () => void;
}) {
  if (step === 'finish') return null;

  const item = copy[step];
  return (
    <div className="game-onboarding-overlay">
      <div className="game-onboarding-card">
        <div className="game-eyebrow">Tutorial</div>
        <div className="game-onboarding-title">{item.title}</div>
        <div className="game-onboarding-body">{item.body}</div>
        <button className="game-button game-button--full" onClick={onNext}>
          {item.cta}
        </button>
      </div>
    </div>
  );
}
