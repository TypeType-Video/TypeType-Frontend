import type { TypeTypeMsePlayer } from "@typetype/mse";
import { observePlaybackVideo, playbackTraceEvent } from "./playback-trace";

export function observeSabrMsePlayback(
  video: HTMLVideoElement,
  videoId: string,
  engine: TypeTypeMsePlayer,
  reportError: (error: unknown, recoveryPositionMs?: number) => void,
): () => void {
  const videoKey = `youtube:${videoId}`;
  const stopVideo = observePlaybackVideo(video, videoKey);
  const offError = engine.on("error", (event) => {
    if (event.type !== "error") return;
    playbackTraceEvent("mse_error", { video: videoKey, code: event.error?.name ?? "unknown" });
    reportError(event.error, event.recoveryPositionMs);
  });
  return () => {
    offError();
    stopVideo();
  };
}
