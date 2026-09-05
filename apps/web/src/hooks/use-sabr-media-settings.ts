import { useEffect } from "react";

export function useSabrMediaSettings(
  video: HTMLVideoElement | null,
  settingsReady: boolean,
  initialVolume: number,
  initialMuted: boolean,
): void {
  useEffect(() => {
    if (!video || !settingsReady) return;
    video.volume = Math.min(1, Math.max(0, initialVolume));
    video.muted = initialMuted;
  }, [initialMuted, initialVolume, settingsReady, video]);
}
