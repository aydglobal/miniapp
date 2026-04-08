const PRODUCTION_API_URL = 'https://adntoken.onrender.com';

function resolveApiUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  // Render static site veya production — direkt API URL
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:4000';
    }
    // Her türlü production ortamı için hardcoded API
    return PRODUCTION_API_URL;
  }

  return PRODUCTION_API_URL;
}

const API_URL = resolveApiUrl();

const RETRY_DELAYS = [500, 1000, 2000];

class UnauthorizedError extends Error {
  constructor() {
    super('Oturum suresi doldu. Lutfen yeniden giris yapin.');
    this.name = 'UnauthorizedError';
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchWithTimeout(input: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    return await fetch(input, {
      ...init,
      cache: 'no-store',
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Sunucu yanit vermedi. Lutfen tekrar dene.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchWithRetry(input: string, init: RequestInit, retries = 3): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(input, init);

      // 401 — retry yapma, oturumu sonlandır
      if (response.status === 401) {
        sessionStorage.removeItem('adn_airdrop_token');
        throw new UnauthorizedError();
      }

      // Başarılı veya son deneme
      if (response.ok || attempt === retries) return response;

      // 5xx — retry
      if (response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`);
        if (attempt < retries) await sleep(RETRY_DELAYS[attempt]);
        continue;
      }

      // 4xx (401, 429 dahil) — retry yapma, direkt dön
      return response;
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      lastError = err;
      if (attempt < retries) await sleep(RETRY_DELAYS[attempt]);
    }
  }

  throw lastError || new Error('Sunucu yanit vermedi. Lutfen tekrar dene.');
}

export async function postJSON<T>(path: string, body: unknown, token?: string): Promise<T> {
  const response = await fetchWithRetry(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function getJSON<T>(path: string, token?: string): Promise<T> {
  const response = await fetchWithRetry(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export { UnauthorizedError };
