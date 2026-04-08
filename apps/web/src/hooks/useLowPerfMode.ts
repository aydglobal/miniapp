import { useEffect } from 'react';
import { useDeviceProfiler, type DeviceCategory } from './useDeviceProfiler';

const PERF_CSS: Record<DeviceCategory, Record<string, string>> = {
  low: { '--animation-duration': '0ms', '--blur-amount': '0px' },
  mid: { '--animation-duration': '200ms', '--blur-amount': '4px' },
  high: { '--animation-duration': '300ms', '--blur-amount': '8px' },
};

export function useLowPerfMode() {
  const profile = useDeviceProfiler();

  useEffect(() => {
    const tier = profile.category;
    document.body.setAttribute('data-perf-tier', tier);

    const vars = PERF_CSS[tier];
    for (const [key, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, [profile.category]);

  return profile;
}
