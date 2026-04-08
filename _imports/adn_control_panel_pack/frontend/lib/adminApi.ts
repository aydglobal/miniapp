export const API_URL = import.meta.env.VITE_API_URL || "";

function initData() {
  return (window as any)?.Telegram?.WebApp?.initData || "";
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-telegram-init-data": initData(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let message = "Admin request failed";
    try {
      const body = await res.json();
      message = body?.error?.message || body?.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}
