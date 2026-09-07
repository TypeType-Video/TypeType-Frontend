import { useCallback, useSyncExternalStore } from "react";

export function useVideoPaused(video: HTMLVideoElement | null, fallback: boolean): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const events = ["play", "pause", "seeked", "emptied"];
      for (const event of events) video?.addEventListener(event, notify);
      return () => {
        for (const event of events) video?.removeEventListener(event, notify);
      };
    },
    [video],
  );
  return useSyncExternalStore(
    subscribe,
    () => video?.paused ?? fallback,
    () => fallback,
  );
}
