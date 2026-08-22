import { isSabrPlaybackEventTransient } from "./sabr-vidstack-bridge";

export function resolveMediaProgressPosition(
  video: HTMLVideoElement | null,
  currentPositionMs: number,
  requestedPositionMs: number | null = null,
): number | null {
  if (requestedPositionMs !== null) return requestedPositionMs;
  if (video && isSabrPlaybackEventTransient(video)) return null;
  return currentPositionMs;
}
