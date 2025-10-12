// src/hooks/useMemorialDefault.ts
'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import defaultsJson from '../utils/default.json';
import { getDeviceInfo } from '../utils/device';

export type DefaultConfig = typeof defaultsJson;

export function useMemorialDefaults(isGuadalupe: boolean | null) {
  const [defaults, setDefaults] = useState<DefaultConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const device = useMemo(() => (typeof window !== 'undefined' ? getDeviceInfo() : null), []);

  useEffect(() => {
    if (isGuadalupe === null || !device) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({
          funeraria: isGuadalupe ? 'guadalupe' : 'sanramon',
          deviceId: device.id, w: String(device.w), h: String(device.h), dpr: String(device.dpr),
        });
        const res = await fetch(`/api/config?${qs}`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const cfg = (data?.config ?? defaultsJson) as DefaultConfig;
        if (!cancelled) setDefaults(cfg);
      } catch {
        if (!cancelled) setDefaults(defaultsJson);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isGuadalupe, device]);

  const save = useCallback(async (next: DefaultConfig) => {
    if (!device || isGuadalupe === null) return false;
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          funeraria: isGuadalupe ? 'guadalupe' : 'sanramon',
          deviceId: device.id, w: device.w, h: device.h, dpr: device.dpr,
          config: next,
        }),
      });
      // Si quieres reflejar localmente tras el commit (sin romper render):
      // setTimeout(() => setDefaults(next), 0);
      return res.ok;
    } catch {
      return false;
    }
  }, [device, isGuadalupe]);

  return { defaults, loading, save };
}
