type Step =
  | "welcome"
  | "tap_once"
  | "open_shop"
  | "buy_upgrade"
  | "open_missions"
  | "open_referral"
  | "finish";

const copy: Record<Exclude<Step, "finish">, { title: string; body: string; cta: string }> = {
  welcome: {
    title: "ADN'e hoş geldin",
    body: "Tap yap, kartlarını geliştir, görev tamamla ve snapshot öncesi gücünü büyüt.",
    cta: "Başla",
  },
  tap_once: {
    title: "İlk tap'ini yap",
    body: "Her tap ADN ve XP kazandırır. Crit ve combo ile daha hızlı büyürsün.",
    cta: "Anladım",
  },
  open_shop: {
    title: "Shop'u aç",
    body: "Kart geliştirerek saatlik ADN üretimini artırırsın. Uzun vadede asıl güç burada.",
    cta: "Devam",
  },
  buy_upgrade: {
    title: "İlk kartını yükselt",
    body: "İlk upgrade'i almak erken oyunu hızlandırır. Sonraki görevleri de kolaylaştırır.",
    cta: "Tamam",
  },
  open_missions: {
    title: "Görevleri unutma",
    body: "Görevler ADN, chest ve boost verir. İlk gün en hızlı ilerleme buradan gelir.",
    cta: "Gördüm",
  },
  open_referral: {
    title: "Kaliteli referral getir",
    body: "Sadece aktif oyuncular sayılır. Güçlü referral zinciri seni eventlerde öne taşır.",
    cta: "Bitir",
  },
};

export default function OnboardingOverlay({
  step,
  onNext,
}: {
  step: Step;
  onNext: () => void;
}) {
  if (step === "finish") return null;

  const item = copy[step];
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 px-4 pb-8">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0B1224] p-5 text-white shadow-2xl">
        <div className="text-xs uppercase tracking-wide text-[#A8B3CF]">Tutorial</div>
        <div className="mt-2 text-2xl font-bold">{item.title}</div>
        <div className="mt-3 text-sm leading-6 text-[#A8B3CF]">{item.body}</div>
        <button
          onClick={onNext}
          className="mt-5 w-full rounded-[18px] bg-gradient-to-r from-[#46D7FF] to-[#8F6BFF] px-4 py-4 font-semibold text-[#050816]"
        >
          {item.cta}
        </button>
      </div>
    </div>
  );
}
