import type { TypeTypeMsePlayer } from "@typetype/mse";
import {
  currentPlaybackTraceContext,
  observePlaybackVideo,
  playbackTraceEvent,
} from "./playback-trace";

export function observeSabrMsePlayback(
  video: HTMLVideoElement,
  videoId: string,
  engine: TypeTypeMsePlayer,
  reportError: (error: unknown, recoveryPositionMs?: number) => void,
): () => void {
  const videoKey = `youtube:${videoId}`;
  const context = currentPlaybackTraceContext();
  const stopVideo = observePlaybackVideo(video, videoKey, context);
  const offError = engine.on("error", (event) => {
    if (event.type !== "error") return;
    playbackTraceEvent(
      "mse_error",
      { video: videoKey, code: event.error?.name ?? "unknown" },
      context,
    );
    reportError(event.error, event.recoveryPositionMs);
  });
  const offEvents = context
    ? [
        engine.on("state", (event) => {
          if (event.type !== "state") return;
          playbackTraceEvent("mse_state", { video: videoKey, state: event.state }, context);
        }),
        engine.on("manifest", (event) => {
          if (event.type !== "manifest") return;
          playbackTraceEvent(
            "mse_manifest",
            { video: videoKey, generation: event.generation, segmentCount: event.segmentCount },
            context,
          );
        }),
        engine.on("quality", (event) => {
          if (event.type !== "quality") return;
          playbackTraceEvent(
            "mse_quality",
            { video: videoKey, videoItag: event.videoItag, audioItag: event.audioItag },
            context,
          );
        }),
        engine.on("segment", (event) => {
          if (event.type !== "segment") return;
          playbackTraceEvent(
            "mse_segment_appended",
            {
              video: videoKey,
              kind: event.kind,
              phase: event.durationMs > 0 ? "media" : "init",
              startMs: event.startMs,
              durationMs: event.durationMs,
            },
            context,
          );
        }),
        engine.on("buffer", (event) => {
          if (event.type !== "buffer") return;
          playbackTraceEvent(
            "mse_buffer",
            {
              video: videoKey,
              bufferedEndMs: event.bufferedEndMs,
              currentTimeMs: event.currentTimeMs,
            },
            context,
          );
        }),
        engine.on("seek", (event) => {
          if (event.type !== "seek") return;
          playbackTraceEvent(
            "mse_seek",
            { video: videoKey, positionMs: event.positionMs },
            context,
          );
        }),
      ]
    : [];
  return () => {
    offError();
    for (const stop of offEvents) stop();
    stopVideo();
  };
}
