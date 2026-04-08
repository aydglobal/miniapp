export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning";

function telegramHaptic(kind: string) {
  const tg = (window as any).Telegram?.WebApp;
  tg?.HapticFeedback?.impactOccurred?.(kind);
}

export function playHaptic(type: HapticType) {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    if (type === "success") {
      tg.HapticFeedback.notificationOccurred?.("success");
      return;
    }
    if (type === "warning") {
      tg.HapticFeedback.notificationOccurred?.("warning");
      return;
    }
    if (type === "light" || type === "medium" || type === "heavy") {
      telegramHaptic(type);
      return;
    }
  }

  if (navigator.vibrate) {
    if (type === "light") navigator.vibrate(10);
    else if (type === "medium") navigator.vibrate(18);
    else if (type === "heavy") navigator.vibrate([22, 12, 22]);
    else if (type === "success") navigator.vibrate([12, 8, 16]);
    else navigator.vibrate([14, 10, 14]);
  }
}
