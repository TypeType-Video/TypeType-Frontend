import { useEffect } from "react";
import { clampPlayerVolume } from "../lib/player-volume-state";

export function useSabrMediaSettings(
  video: HTMLVideoElement | null,
  settingsReady: boolean,
  initialVolume: number,
  initialMuted: boolean,
): void {
  useEffect(() => {
    if (!video || !settingsReady) return;
    video.volume = clampPlayerVolume(initialVolume);
    video.muted = initialMuted;
  }, [initialMuted, initialVolume, settingsReady, video]);
}
