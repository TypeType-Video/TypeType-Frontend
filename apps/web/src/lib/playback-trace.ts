import { sanitizeRequestPath, sanitizeVideoContext } from "./debug-sanitize";
import { recordClientEvent } from "./client-debug-log";
import { toWatchSourceUrl } from "./watch-url";

const TRACE_HEADER = "X-Playback-Trace-ID";
const ENABLE_KEY = "typetype-debug-console";
const WATCH_API_PATHS = ["/streams/youtube/", "/sabr/playback/", "/comments", "/subtitles"];
let activeTraceId: string | null = null;
let activeVideo: string | null = null;
let traceStartedAt = 0;
let observersInstalled = false;

export type PlaybackRequestTrace = {
  init: RequestInit;
  traceId?: string;
  path?: string;
  startedAt?: number;
};

function enabled(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(ENABLE_KEY) === "1";
  } catch {
    return false;
  }
}

function newTraceId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeResourcePath(path: string): string {
  return sanitizeRequestPath(path).replace(/\/sabr\/playback\/[^/]+/g, "/sabr/playback/{session}");
}

export function playbackTraceEvent(event: string, details: Record<string, string | number | boolean | null> = {}): void {
  if (!enabled() || !activeTraceId) return;
  recordClientEvent(`playback.${event}`, {
    traceId: activeTraceId,
    elapsedMs: Math.round(performance.now() - traceStartedAt),
    ...details,
  });
}

export function beginPlaybackTrace(
  videoUrl: string,
  source = "route_enter",
  forceRestart = false,
): string | null {
  if (!enabled()) return null;
  const video = sanitizeVideoContext(videoUrl) ?? "unknown";
  if (forceRestart || !activeTraceId || activeVideo !== video) {
    activeTraceId = newTraceId();
    activeVideo = video;
    traceStartedAt = performance.now();
    installPerformanceObservers();
    playbackTraceEvent("trace_start", { video, source, timeOrigin: Math.round(performance.timeOrigin) });
  }
  return activeTraceId;
}

export function currentPlaybackTraceId(): string | null {
  return enabled() ? activeTraceId : null;
}

export function addPlaybackTraceHeader(headers: Headers): Headers {
  const traceId = currentPlaybackTraceId();
  if (traceId) headers.set(TRACE_HEADER, traceId);
  return headers;
}

export function preparePlaybackApiRequest(url: string, init: RequestInit = {}): PlaybackRequestTrace {
  if (!enabled() || typeof window === "undefined") return { init };
  let parsed: URL;
  try {
    parsed = new URL(url, window.location.href);
  } catch {
    return { init };
  }
  if (parsed.origin !== window.location.origin || !WATCH_API_PATHS.some((path) => parsed.pathname.includes(path))) {
    return { init };
  }
  const sourceUrl = parsed.searchParams.get("url");
  const traceId = activeTraceId ?? (sourceUrl ? beginPlaybackTrace(sourceUrl, "api_request") : null);
  if (!traceId) return { init };
  const headers = addPlaybackTraceHeader(new Headers(init.headers));
  const path = normalizeResourcePath(parsed.pathname);
  const method = init.method ?? "GET";
  playbackTraceEvent("api_start", { method, path });
  return { init: { ...init, headers }, traceId, path, startedAt: performance.now() };
}

export function finishPlaybackApiRequest(trace: PlaybackRequestTrace, status: number, outcome = "ok"): void {
  if (!trace.traceId || !trace.path || trace.startedAt === undefined) return;
  playbackTraceEvent("api_end", {
    method: trace.init.method ?? "GET",
    path: trace.path,
    status,
    outcome,
    durationMs: Math.round(performance.now() - trace.startedAt),
  });
}

export function observePlaybackVideo(video: HTMLVideoElement, videoKey: string): () => void {
  if (!enabled()) return () => undefined;
  const events = ["loadedmetadata", "loadeddata", "canplay", "playing", "waiting", "stalled", "seeking", "seeked", "error"];
  let firstFrame = false;
  const onEvent = (event: Event) => {
    const ranges: number[] = [];
    for (let i = 0; i < video.buffered.length; i++) ranges.push(Math.max(0, video.buffered.end(i) - video.currentTime));
    playbackTraceEvent(`video_${event.type}`, {
      video: videoKey,
      readyState: video.readyState,
      networkState: video.networkState,
      currentTimeMs: Math.round(video.currentTime * 1000),
      bufferedAheadMs: Math.round(Math.max(0, ...ranges) * 1000),
      width: video.videoWidth,
      height: video.videoHeight,
      textTrackCount: video.textTracks.length,
      visibleTextTracks: Array.from(video.textTracks).filter((track) => track.mode === "showing").length,
    });
  };
  for (const event of events) video.addEventListener(event, onEvent);
  const frameVideo = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: (now: number, metadata: { presentedFrames?: number }) => void) => number;
    cancelVideoFrameCallback?: (id: number) => void;
  };
  const frameId = frameVideo.requestVideoFrameCallback?.((now, metadata) => {
    firstFrame = true;
    playbackTraceEvent("first_frame", {
      video: videoKey,
      frameCallbackMs: Math.round(now),
      presentedFrames: metadata.presentedFrames ?? 0,
      currentTimeMs: Math.round(video.currentTime * 1000),
    });
  });
  const onFirstData = () => {
    if (firstFrame) return;
    playbackTraceEvent("first_media_data", { video: videoKey, readyState: video.readyState });
  };
  video.addEventListener("loadeddata", onFirstData, { once: true });
  playbackTraceEvent("video_attached", { video: videoKey, textTrackCount: video.textTracks.length });
  return () => {
    for (const event of events) video.removeEventListener(event, onEvent);
    video.removeEventListener("loadeddata", onFirstData);
    if (frameId !== undefined) frameVideo.cancelVideoFrameCallback?.(frameId);
  };
}

function installPerformanceObservers(): void {
  if (observersInstalled || typeof PerformanceObserver === "undefined") return;
  observersInstalled = true;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const task = entry as PerformanceEntry & { attribution?: Array<{ name?: string }> };
        playbackTraceEvent("long_task", {
          durationMs: Math.round(entry.duration),
          startMs: Math.round(entry.startTime),
          attribution: task.attribution?.[0]?.name ?? "unknown",
        });
      }
    }).observe({ type: "longtask", buffered: true });
  } catch { /* Long-task timing is not supported in every browser. */ }
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        if (entry.startTime < traceStartedAt) continue;
        let url: URL;
        try { url = new URL(entry.name); } catch { continue; }
        if (url.origin !== window.location.origin || !url.pathname.includes("/sabr/playback/")) continue;
        playbackTraceEvent("sabr_resource", {
          path: normalizeResourcePath(url.pathname),
          durationMs: Math.round(entry.duration),
          ttfbMs: Math.round(Math.max(0, entry.responseStart - entry.requestStart)),
          downloadMs: Math.round(Math.max(0, entry.responseEnd - entry.responseStart)),
          encodedBytes: entry.encodedBodySize,
          transferBytes: entry.transferSize,
        });
      }
    }).observe({ type: "resource", buffered: true });
  } catch { /* Resource timing may be restricted by browser policy. */ }
}

function installWatchClickCapture(): void {
  if (typeof document === "undefined") return;
  document.addEventListener("click", (event) => {
    if (!enabled()) return;
    const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(target instanceof HTMLAnchorElement)) return;
    let url: URL;
    try { url = new URL(target.href, window.location.href); } catch { return; }
    if (url.pathname !== "/watch") return;
    const source = url.searchParams.get("v");
    if (source) beginPlaybackTrace(toWatchSourceUrl(source), "watch_click", true);
  }, true);
}

installWatchClickCapture();
