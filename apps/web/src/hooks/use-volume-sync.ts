import { useCallback, useEffect, useRef } from "react";
import type { SettingsItem } from "../types/user";

type MutateFn = (patch: Partial<SettingsItem>) => void;
type VolumeState = Pick<SettingsItem, "volume" | "muted">;

function sameVolume(a: VolumeState | null | undefined, b: VolumeState) {
  return a?.volume === b.volume && a.muted === b.muted;
}

export function createDebouncedVolumeSync(
  mutate: MutateFn,
  delayMs = 1000,
  current: () => VolumeState | undefined = () => undefined,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: VolumeState | null = null;
  return {
    schedule(volume: number, muted: boolean) {
      const next = { volume, muted };
      if (sameVolume(pending, next)) return;
      if (timer) clearTimeout(timer);
      timer = null;
      pending = null;
      if (sameVolume(current(), next)) return;
      pending = next;
      timer = setTimeout(() => {
        timer = null;
        pending = null;
        if (!sameVolume(current(), next)) mutate(next);
      }, delayMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      pending = null;
    },
  };
}

export function useVolumeSync(
  mutate: MutateFn,
  current: VolumeState,
): (volume: number, muted: boolean) => void {
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;
  const currentRef = useRef(current);
  currentRef.current = current;
  const syncRef = useRef<ReturnType<typeof createDebouncedVolumeSync> | null>(null);
  if (!syncRef.current) {
    syncRef.current = createDebouncedVolumeSync(
      (patch) => mutateRef.current(patch),
      1000,
      () => currentRef.current,
    );
  }
  useEffect(() => () => syncRef.current?.cancel(), []);

  return useCallback((volume: number, muted: boolean) => {
    syncRef.current?.schedule(volume, muted);
  }, []);
}
