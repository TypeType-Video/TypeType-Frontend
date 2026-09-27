import { sanitizeRequestPath } from "./debug-sanitize";
import type { PlaybackTraceContext } from "./playback-trace";
import { toWatchSourceUrl } from "./watch-url";

type TraceEventWriter = (
  event: string,
  details?: Record<string, string | number | boolean | null>,
  context?: PlaybackTraceContext | null,
) => void;

type TraceContextAt = (startTime: number) => PlaybackTraceContext | null;

function normalizeResourcePath(path: string): string {
  return sanitizeRequestPath(path).replace(/\/sabr\/playback\/[^/]+/g, "/sabr/playback/{session}");
}

export function installPlaybackPerformanceObservers(
  contextAt: TraceContextAt,
  emit: TraceEventWriter,
): void {
  if (performanceObserversInstalled || typeof PerformanceObserver === "undefined") return;
  performanceObserversInstalled = true;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const context = contextAt(entry.startTime);
        if (!context) continue;
        const task = entry as PerformanceEntry & { attribution?: Array<{ name?: string }> };
        emit(
          "long_task",
          {
            durationMs: Math.round(entry.duration),
            startMs: Math.round(entry.startTime),
            attribution: task.attribution?.[0]?.name ?? "unknown",
          },
          context,
        );
      }
    }).observe({ type: "longtask", buffered: true });
  } catch {
    /* Long-task timing is not supported in every browser. */
  }
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        const context = contextAt(entry.startTime);
        if (!context) continue;
        let url: URL;
        try {
          url = new URL(entry.name);
        } catch {
          continue;
        }
        if (url.origin !== window.location.origin || !url.pathname.includes("/sabr/playback/"))
          continue;
        emit(
          "sabr_resource",
          {
            path: normalizeResourcePath(url.pathname),
            durationMs: Math.round(entry.duration),
            ttfbMs: Math.round(Math.max(0, entry.responseStart - entry.requestStart)),
            downloadMs: Math.round(Math.max(0, entry.responseEnd - entry.responseStart)),
            encodedBytes: entry.encodedBodySize,
            transferBytes: entry.transferSize,
          },
          context,
        );
      }
    }).observe({ type: "resource", buffered: true });
  } catch {
    /* Resource timing may be restricted by browser policy. */
  }
}

let performanceObserversInstalled = false;

export function installPlaybackWatchClickCapture(
  isEnabled: () => boolean,
  beginTrace: (videoUrl: string, source: string, forceRestart: boolean) => string | null,
): void {
  if (typeof document === "undefined") return;
  document.addEventListener(
    "click",
    (event) => {
      if (!isEnabled()) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement)) return;
      let url: URL;
      try {
        url = new URL(target.href, window.location.href);
      } catch {
        return;
      }
      if (url.pathname !== "/watch") return;
      const source = url.searchParams.get("v");
      if (source) beginTrace(toWatchSourceUrl(source), "watch_click", true);
    },
    true,
  );
}
