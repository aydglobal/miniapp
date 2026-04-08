import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { getJSON, postJSON } from '../lib/api';
import { bootTelegramUI, getInitData, getStartParam, getTelegramWebApp } from '../lib/telegram';

const fpPromise = FingerprintJS.load();

async function waitForInitData() {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    bootTelegramUI();
    const initData = getInitData();
    if (initData) return initData;

    const webApp = getTelegramWebApp();
    if (!webApp && attempt < 8) {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      continue;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }

  return '';
}

function getSimpleFingerprint(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset()
  ];

  let hash = 0;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

async function getFingerprint(): Promise<string> {
  try {
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  } catch {
    return getSimpleFingerprint();
  }
}

async function loginWithPreview(setToken: (v: string) => void, setUser: (v: any) => void) {
  const savedPreviewId = localStorage.getItem('adn_preview_id');
  const previewId = savedPreviewId || Math.random().toString(36).slice(2, 10);
  localStorage.setItem('adn_preview_id', previewId);

  const data = await postJSON<{ token: string; user: any }>('/auth/preview', {
    previewId,
    referralCode: getStartParam() || undefined
  });

  sessionStorage.setItem('adn_airdrop_token', data.token);
  setToken(data.token);
  setUser(data.user);
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('adn_airdrop_token');
    const platform = navigator.platform || 'web';

    // Saved token varsa önce /api/me ile user'ı yükle, sonra yeniden auth yap
    const tryRestoreSession = saved
      ? getJSON<any>('/api/me', saved)
          .then((profile) => {
            setToken(saved);
            setUser(profile);
            return true; // restored
          })
          .catch(() => false) // token expired, re-auth
      : Promise.resolve(false);

    tryRestoreSession.then((restored) => {
      if (restored) {
        setLoading(false);
        return;
      }

      Promise.all([waitForInitData(), getFingerprint()])
        .then(([initData, fingerprint]) => {
          if (!initData) {
            setIsTelegramAvailable(false);
            return loginWithPreview(setToken, setUser).catch((previewError) => {
              setError('Sunucu baglantisi kurulamadi. Lutfen tekrar dene.');
              throw previewError;
            });
          }

          return postJSON<{ token: string; user: any }>('/auth/telegram', {
            initData,
            referralCode: getStartParam() || undefined,
            fingerprint,
            platform
          })
            .then((data) => {
              sessionStorage.setItem('adn_airdrop_token', data.token);
              setToken(data.token);
              setUser(data.user);
            })
            .catch((telegramError) => {
              setIsTelegramAvailable(true);
              setError(`Telegram oturumu kurulamadi. ${String(telegramError)}`);
              throw telegramError;
            });
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false));
    });
  }, []);

  return { token, user, setUser, loading, error, isTelegramAvailable };
}
