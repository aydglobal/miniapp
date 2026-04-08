import { useEffect, useState } from 'react';

export type DeviceCategory = 'high' | 'mid' | 'low';

export interface DeviceProfile {
  category: DeviceCategory;
  memory?: number;
  connection?: string;
  fps?: number;
}

function measureFps(): Promise<number> {
  return new Promise(resolve => {
    let frames = 0;
    const start = performance.now();
    const tick = () => {
      frames++;
      if (performance.now() - start < 1000) {
        requestAnimationFrame(tick);
      } else {
        resolve(frames);
      }
    };
    requestAnimationFrame(tick);
  });
}

function categorize(memory?: number, connection?: string, fps?: number): DeviceCategory {
  if (fps !== undefined && fps < 30) return 'low';
  if (memory !== undefined && memory <= 2) return 'low';
  if (connection === '2g' || connection === 'slow-2g') return 'low';

  if (fps !== undefined && fps >= 55 && (memory === undefined || memory >= 4)) return 'high';
  if (memory !== undefined && memory >= 6) return 'high';

  return 'mid';
}

export function useDeviceProfiler(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(() => {
    try {
      const saved = localStorage.getItem('deviceProfile');
      if (saved) return JSON.parse(saved) as DeviceProfile;
    } catch { /* ignore */ }
    return { category: 'mid' };
  });

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      const nav = navigator as any;
      const memory: number | undefined = nav.deviceMemory;
      const connection: string | undefined = nav.connection?.effectiveType;
      const fps = await measureFps();

      if (cancelled) return;

      const category = categorize(memory, connection, fps);
      const newProfile: DeviceProfile = { category, memory, connection, fps };

      try {
        localStorage.setItem('deviceProfile', JSON.stringify(newProfile));
      } catch { /* ignore */ }

      setProfile(newProfile);
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  return profile;
}
