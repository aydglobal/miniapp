declare global {
  interface Window {
    Telegram?: any;
  }
}

export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

export function getInitData() {
  return getTelegramWebApp()?.initData || '';
}

export function getStartParam() {
  const webApp = getTelegramWebApp();
  const startParam = webApp?.initDataUnsafe?.start_param;
  if (startParam) return String(startParam);

  const url = new URL(window.location.href);
  return url.searchParams.get('ref') || url.searchParams.get('startapp') || '';
}

export function bootTelegramUI() {
  const webApp = getTelegramWebApp();
  if (!webApp) return;
  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor?.('#08131f');
  webApp.setBackgroundColor?.('#08131f');
}
