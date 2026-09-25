import { recordClientEvent } from "./client-debug-log";
import { sanitizeRequestPath, sanitizeVideoContext } from "./debug-sanitize";
import {
  installPlaybackPerformanceObservers,
  installPlaybackWatchClickCapture,
} from "./playback-trace-observers";
import { observePlaybackVideo as observePlaybackVideoEvents } from "./playback-video-trace";

const TRACE_HEADER = "X-Playback-Trace-ID";
const ENABLE_KEY = "typetype-debug-console";
const WATCH_API_PATHS = ["/streams/youtube/", "/sabr/playback/", "/comments", "/subtitles"];
let activeTraceId: string | null = null;
let activeVideo: string | null = null;
let traceStartedAt = 0;
const traceContexts: PlaybackTraceContext[] = [];

export type PlaybackTraceContext = { traceId: string; startedAt: number };

export type PlaybackRequestTrace = {
  init: RequestInit;
  traceId?: string;
  path?: string;
  startedAt?: number;
  context?: PlaybackTraceContext;
};

function enabled(): boolean {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(ENABLE_KEY) === "1";
  } catch {
    return false;
  }
}

function newTraceId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function normalizeResourcePath(path: string): string {
  return sanitizeRequestPath(path).replace(/\/sabr\/playback\/[^/]+/g, "/sabr/playback/{session}");
}

export function currentPlaybackTraceContext(): PlaybackTraceContext | null {
  return enabled() && activeTraceId ? { traceId: activeTraceId, startedAt: traceStartedAt } : null;
}

function playbackTraceContextAt(startedAt: number): PlaybackTraceContext | null {
  for (let index = traceContexts.length - 1; index >= 0; index--) {
    const context = traceContexts[index];
    if (context && context.startedAt <= startedAt) return context;
  }
  return null;
}

export function playbackTraceEvent(
  event: string,
  details: Record<string, string | number | boolean | null> = {},
  context = currentPlaybackTraceContext(),
): void {
  if (!enabled() || !context) return;
  recordClientEvent(`playback.${event}`, {
    traceId: context.traceId,
    elapsedMs: Math.round(performance.now() - context.startedAt),
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
    traceContexts.push({ traceId: activeTraceId, startedAt: traceStartedAt });
    if (traceContexts.length > 16) traceContexts.shift();
    installPlaybackPerformanceObservers(playbackTraceContextAt, playbackTraceEvent);
    playbackTraceEvent("trace_start", {
      video,
      source,
      timeOrigin: Math.round(performance.timeOrigin),
    });
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

export function preparePlaybackApiRequest(
  url: string,
  init: RequestInit = {},
): PlaybackRequestTrace {
  if (!enabled() || typeof window === "undefined") return { init };
  let parsed: URL;
  try {
    parsed = new URL(url, window.location.href);
  } catch {
    return { init };
  }
  if (
    parsed.origin !== window.location.origin ||
    !WATCH_API_PATHS.some((path) => parsed.pathname.includes(path))
  ) {
    return { init };
  }
  const sourceUrl = parsed.searchParams.get("url");
  const traceId =
    activeTraceId ?? (sourceUrl ? beginPlaybackTrace(sourceUrl, "api_request") : null);
  if (!traceId) return { init };
  const context = currentPlaybackTraceContext();
  if (!context) return { init };
  const headers = addPlaybackTraceHeader(new Headers(init.headers));
  const path = normalizeResourcePath(parsed.pathname);
  const method = init.method ?? "GET";
  playbackTraceEvent("api_start", { method, path }, context);
  return { init: { ...init, headers }, traceId, path, startedAt: performance.now(), context };
}

export function finishPlaybackApiRequest(
  trace: PlaybackRequestTrace,
  status: number,
  outcome = "ok",
): void {
  if (!trace.traceId || !trace.path || trace.startedAt === undefined || !trace.context) return;
  playbackTraceEvent(
    "api_end",
    {
      method: trace.init.method ?? "GET",
      path: trace.path,
      status,
      outcome,
      durationMs: Math.round(performance.now() - trace.startedAt),
    },
    trace.context,
  );
}

export function observePlaybackVideo(
  video: HTMLVideoElement,
  videoKey: string,
  context = currentPlaybackTraceContext(),
): () => void {
  return observePlaybackVideoEvents(video, videoKey, context, enabled, playbackTraceEvent);
}

installPlaybackWatchClickCapture(enabled, beginPlaybackTrace);
