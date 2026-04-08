export type TriggerType =
  | "energy_full"
  | "daily_ready"
  | "boost_expired"
  | "churn_risk"
  | "referral_push"
  | "mission_ready";

export function buildNudge(input: {
  username?: string | null;
  segment: string;
  trigger: TriggerType;
  streak?: number;
}) {
  const name = input.username ? `${input.username}, ` : "";

  switch (input.trigger) {
    case "energy_full":
      return `${name}enerjin doldu. Kısa bir tur atıp ADN toplayabilirsin.`;
    case "daily_ready":
      return `${name}günlük ödülün hazır. Kaçırmadan al.`;
    case "boost_expired":
      return `${name}boost süren bitti. Görevleri tamamlayıp yeni boost açabilirsin.`;
    case "churn_risk":
      return `${name}streak’in kırılmadan geri dön. Seni ekstra ödül bekliyor.`;
    case "referral_push":
      return `${name}1 kaliteli davet daha getir, yeni ödül zinciri açılsın.`;
    case "mission_ready":
      return `${name}yeni görevlerin hazır. Hızlıca girip ödülleri topla.`;
  }
}
