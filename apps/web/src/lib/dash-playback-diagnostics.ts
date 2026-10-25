import type * as dashjs from "dashjs";
import { recordClientEvent } from "./client-debug-log";

const MAX_FRAGMENT_EVENTS = 12;
const MAX_RANGE_REQUEST_EVENTS = 64;
const HTTP_REQUEST_METRIC = "HttpList";

function elapsedMs(start: Date | null | undefined, end: Date | null | undefined): number | null {
  if (!(start instanceof Date) || !(end instanceof Date)) return null;
  const elapsed = end.getTime() - start.getTime();
  return Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null;
}

function rangeByteLength(value: unknown): number | null {
  const match = typeof value === "string" ? /^(\d+)-(\d+)$/.exec(value) : null;
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(match[2]);
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && end >= start
    ? end - start + 1
    : null;
}

function traceByteLength(value: unknown): number | null {
  if (!Array.isArray(value)) return null;
  const total = value.reduce<number>((sum, entry: unknown) => {
    if (!entry || typeof entry !== "object" || !("b" in entry)) return sum;
    const bytes = entry.b;
    return typeof bytes === "number" && Number.isFinite(bytes) && bytes >= 0 ? sum + bytes : sum;
  }, 0);
  return total > 0 ? total : null;
}

export function attachDashPlaybackDiagnostics(
  player: dashjs.MediaPlayerClass,
  library: typeof dashjs,
): void {
  let fragmentEvents = 0;
  let rangeRequestEvents = 0;
  const bufferStates = new Map<dashjs.MediaType, boolean>();
  const events = library.MediaPlayer.events;

  player.on(events.ERROR, (event) => {
    const payload =
      "event" in event && typeof event.event === "object" && event.event !== null
        ? event.event
        : null;
    const request = payload && "request" in payload ? payload.request : null;
    const status =
      request && typeof request === "object" && "status" in request ? request.status : null;
    const errorCode =
      typeof event.error === "object" && event.error !== null && "code" in event.error
        ? event.error.code
        : null;
    const errorId = payload && "id" in payload ? payload.id : null;

    recordClientEvent("playback.dash_error", {
      errorCategory: typeof event.error === "string" ? event.error : null,
      errorCode: typeof errorCode === "number" ? errorCode : null,
      errorId: typeof errorId === "string" || typeof errorId === "number" ? errorId : null,
      httpStatus: typeof status === "number" ? status : null,
    });
  });

  const recordBufferState = (mediaType: dashjs.MediaType, stalled: boolean) => {
    if (bufferStates.get(mediaType) === stalled) return;
    bufferStates.set(mediaType, stalled);
    recordClientEvent("playback.dash_buffer", { mediaType, stalled });
  };
  player.on(events.BUFFER_EMPTY, (event) => recordBufferState(event.mediaType, true));
  player.on(events.BUFFER_LOADED, (event) => recordBufferState(event.mediaType, false));
  player.on(events.FRAGMENT_LOADING_ABANDONED, (event) => {
    recordClientEvent("playback.dash_fragment_abandoned", { mediaType: event.mediaType });
  });
  // SegmentBase/SIDX fetches are reported through HTTP metrics, not fragment events.
  player.on(events.METRIC_ADDED, (event) => {
    if (
      String(event.metric) !== HTTP_REQUEST_METRIC ||
      rangeRequestEvents >= MAX_RANGE_REQUEST_EVENTS
    )
      return;
    const request = event.value as Partial<dashjs.HTTPRequest>;
    const requestedBytes = rangeByteLength(request.range);
    if (requestedBytes === null) return;
    rangeRequestEvents += 1;
    recordClientEvent("playback.dash_range_request", {
      mediaType:
        request._stream === "audio" || request._stream === "video" ? request._stream : null,
      requestType: request.type,
      rangeBytes: requestedBytes,
      responseBytes: traceByteLength(request.trace),
      httpStatus: typeof request.responsecode === "number" ? request.responsecode : null,
      requestMs: elapsedMs(request.trequest, request._tfinish),
      ttfbMs: elapsedMs(request.trequest, request.tresponse),
      downloadMs: elapsedMs(request.tresponse, request._tfinish),
    });
  });
  player.on(events.FRAGMENT_LOADING_COMPLETED, (event) => {
    if (fragmentEvents >= MAX_FRAGMENT_EVENTS) return;
    fragmentEvents += 1;
    const request = event.request;
    recordClientEvent("playback.dash_fragment_completed", {
      segmentType: request.type,
      mediaType: request.mediaType,
      startTimeMs: Number.isFinite(request.startTime) ? Math.round(request.startTime * 1000) : null,
      durationMs: Number.isFinite(request.duration) ? Math.round(request.duration * 1000) : null,
      requestMs: elapsedMs(request.startDate, request.requestEndDate),
      ttfbMs: elapsedMs(request.startDate, request.firstByteDate),
      downloadMs: elapsedMs(request.firstByteDate, request.requestEndDate),
      responseBytes: event.response.byteLength,
    });
  });
}
