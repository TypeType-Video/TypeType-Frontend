import type { PlaybackTraceContext } from "./playback-trace";

type TraceEventWriter = (
  event: string,
  details?: Record<string, string | number | boolean | null>,
  context?: PlaybackTraceContext | null,
) => void;

export function observePlaybackVideo(
  video: HTMLVideoElement,
  videoKey: string,
  context: PlaybackTraceContext | null,
  isEnabled: () => boolean,
  emit: TraceEventWriter,
): () => void {
  if (!isEnabled()) return () => undefined;
  const events = [
    "loadedmetadata",
    "loadeddata",
    "canplay",
    "playing",
    "waiting",
    "stalled",
    "seeking",
    "seeked",
    "error",
  ];
  let firstFrame = false;
  const onEvent = (event: Event) => {
    const ranges: number[] = [];
    for (let index = 0; index < video.buffered.length; index++) {
      ranges.push(Math.max(0, video.buffered.end(index) - video.currentTime));
    }
    emit(
      `video_${event.type}`,
      {
        video: videoKey,
        readyState: video.readyState,
        networkState: video.networkState,
        currentTimeMs: Math.round(video.currentTime * 1000),
        bufferedAheadMs: Math.round(Math.max(0, ...ranges) * 1000),
        width: video.videoWidth,
        height: video.videoHeight,
        textTrackCount: video.textTracks.length,
        visibleTextTracks: Array.from(video.textTracks).filter((track) => track.mode === "showing")
          .length,
      },
      context,
    );
  };
  for (const event of events) video.addEventListener(event, onEvent);
  const frameVideo = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (
      callback: (now: number, metadata: { presentedFrames?: number }) => void,
    ) => number;
    cancelVideoFrameCallback?: (id: number) => void;
  };
  const frameId = frameVideo.requestVideoFrameCallback?.((now, metadata) => {
    firstFrame = true;
    emit(
      "first_frame",
      {
        video: videoKey,
        frameCallbackMs: Math.round(now),
        presentedFrames: metadata.presentedFrames ?? 0,
        currentTimeMs: Math.round(video.currentTime * 1000),
      },
      context,
    );
  });
  const onFirstData = () => {
    if (firstFrame) return;
    emit("first_media_data", { video: videoKey, readyState: video.readyState }, context);
  };
  video.addEventListener("loadeddata", onFirstData, { once: true });
  emit("video_attached", { video: videoKey, textTrackCount: video.textTracks.length }, context);
  return () => {
    for (const event of events) video.removeEventListener(event, onEvent);
    video.removeEventListener("loadeddata", onFirstData);
    if (frameId !== undefined) frameVideo.cancelVideoFrameCallback?.(frameId);
  };
}
