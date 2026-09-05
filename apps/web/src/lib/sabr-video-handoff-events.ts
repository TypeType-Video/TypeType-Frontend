import { positionMs } from "./sabr-player-seek";
import type { SabrVideoHandoff } from "./sabr-video-handoff";

const captureEvents = ["timeupdate", "seeking", "seeked", "pause"] as const;

export function registerSabrVideoHandoffPositionCapture(
  video: HTMLVideoElement,
  handoff: SabrVideoHandoff,
  videoId: string,
): () => void {
  const capturePosition = () => handoff.capture(video, videoId, positionMs(video));
  for (const event of captureEvents) video.addEventListener(event, capturePosition);
  return () => {
    for (const event of captureEvents) video.removeEventListener(event, capturePosition);
  };
}

export function captureSabrVideoHandoffCleanupPosition(
  video: HTMLVideoElement,
  handoff: SabrVideoHandoff,
  videoId: string,
): void {
  handoff.capture(video, videoId, Number.isFinite(video.currentTime) ? positionMs(video) : 0);
}
