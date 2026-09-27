import { type RefObject, useCallback } from "react";
import { recordClientEvent } from "../lib/client-debug-log";
import type { SabrPlaybackConfig } from "../lib/sabr-source";
import { useLatestValue } from "./use-latest-value";

type DebugDetails = Record<string, string | number | boolean | null | undefined>;

function rangeDetails(video: HTMLVideoElement | null, kind: "buffered" | "seekable"): DebugDetails {
  const prefix = kind === "buffered" ? "buffered" : "seekable";
  try {
    const ranges = video?.[kind];
    const count = ranges?.length ?? 0;
    return {
      [`${prefix}RangeCount`]: count,
      [`${prefix}StartMs`]: ranges && count > 0 ? Math.round(ranges.start(0) * 1000) : null,
      [`${prefix}EndMs`]: ranges && count > 0 ? Math.round(ranges.end(count - 1) * 1000) : null,
    };
  } catch {
    return {
      [`${prefix}RangeCount`]: -1,
      [`${prefix}StartMs`]: null,
      [`${prefix}EndMs`]: null,
    };
  }
}

export function useSabrErrorReporter(
  errorReportedRef: RefObject<boolean>,
  onError: (recoveryPositionMs?: number) => void,
  video: HTMLVideoElement | null,
  config: SabrPlaybackConfig,
) {
  const latestOnError = useLatestValue(onError);
  const latestContext = useLatestValue({ video, config });
  return useCallback(
    (error: unknown, recoveryPositionMs?: number) => {
      if (errorReportedRef.current) return;
      errorReportedRef.current = true;
      const { video, config } = latestContext();
      const message = error instanceof Error ? error.message : String(error);
      const playerTimeMs =
        video && Number.isFinite(video.currentTime) ? Math.round(video.currentTime * 1000) : null;
      recordClientEvent("player.sabr_engine_error", {
        videoId: config.videoId,
        isLive: config.isLive ?? false,
        videoItag: config.videoItag,
        audioItag: config.audioItag,
        audioTrackId: config.audioTrackId,
        errorName: error instanceof Error ? error.name : null,
        error: message,
        errorStack:
          error instanceof Error ? error.stack?.split("\n").slice(0, 4).join(" | ") : null,
        recoveryPositionMs,
        playerTimeMs,
        readyState: video?.readyState ?? null,
        networkState: video?.networkState ?? null,
        paused: video?.paused ?? null,
        ...rangeDetails(video, "buffered"),
        ...rangeDetails(video, "seekable"),
      });
      latestOnError()(recoveryPositionMs);
    },
    [errorReportedRef, latestContext, latestOnError],
  );
}
