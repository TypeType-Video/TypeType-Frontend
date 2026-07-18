import type { PlaybackMode } from "./playback-mode";

export function resolveEmbedAutoplay(
  retryKey: number,
  playbackIntent: boolean,
  requestedAutoplay: boolean,
): boolean {
  return retryKey === 0 ? requestedAutoplay : playbackIntent;
}

export function resolveEmbedPlaybackMode(
  framed: boolean,
  storedPlaybackMode: PlaybackMode,
): PlaybackMode {
  return framed ? "sabr" : storedPlaybackMode;
}
