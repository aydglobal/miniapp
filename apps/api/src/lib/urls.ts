export function createMiniAppUrl(miniAppUrl: string, referralCode?: string) {
  if (!referralCode) return miniAppUrl;
  const glue = miniAppUrl.includes('?') ? '&' : '?';
  return `${miniAppUrl}${glue}ref=${encodeURIComponent(referralCode)}`;
}

export function createBotStartUrl(botUsername: string, payload: string) {
  return `https://t.me/${botUsername}?start=${encodeURIComponent(payload)}`;
}

export function createBotStartAppUrl(botUsername: string, payload: string) {
  return `https://t.me/${botUsername}?startapp=${encodeURIComponent(payload)}`;
}
