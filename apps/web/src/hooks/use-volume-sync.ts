import { useCallback, useEffect, useRef } from "react";
import type { SettingsItem } from "../types/user";

type MutateFn = (patch: Partial<SettingsItem>) => void;

export function createDebouncedVolumeSync(mutate: MutateFn, delayMs = 1000) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    schedule(volume: number, muted: boolean) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        mutate({ volume, muted });
      }, delayMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}

export function useVolumeSync(mutate: MutateFn): (volume: number, muted: boolean) => void {
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;
  const syncRef = useRef<ReturnType<typeof createDebouncedVolumeSync> | null>(null);
  if (!syncRef.current) {
    syncRef.current = createDebouncedVolumeSync((patch) => mutateRef.current(patch));
  }
  useEffect(() => () => syncRef.current?.cancel(), []);

  return useCallback((volume: number, muted: boolean) => {
    syncRef.current?.schedule(volume, muted);
  }, []);
}
