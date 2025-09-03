// usePersistentStateManual.ts
"use client";
import { useEffect, useState } from "react";

export function usePersistentStateManual<T>(key: string, initialValue: T) {
  const [persisted, setPersisted]   = useState<T>(initialValue);
  const [draft, setDraft]           = useState<T>(initialValue);
  const [ready, setReady]           = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const val = JSON.parse(raw) as T;
        setPersisted(val);
        setDraft(val);
      }
    } catch {}
    setReady(true); // 👈 ya cargó (o no había nada)
  }, [key]);

  const commit = () => {
    localStorage.setItem(key, JSON.stringify(draft));
    setPersisted(draft);
  };

  const revert = () => setDraft(persisted);

  return { draft, setDraft, persisted, commit, revert, ready };
}
