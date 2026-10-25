import { afterEach, expect, test } from "bun:test";
import type * as dashjs from "dashjs";
import { clearClientDebugLogs, getClientDebugLogs } from "../src/lib/client-debug-log";
import { attachDashPlaybackDiagnostics } from "../src/lib/dash-playback-diagnostics";

const events = {
  ERROR: "error",
  BUFFER_EMPTY: "bufferStalled",
  BUFFER_LOADED: "bufferLoaded",
  FRAGMENT_LOADING_ABANDONED: "fragmentLoadingAbandoned",
  FRAGMENT_LOADING_COMPLETED: "fragmentLoadingCompleted",
  METRIC_ADDED: "metricAdded",
};

function playerWithListeners() {
  const listeners = new Map<string, (event: unknown) => void>();
  const player = {
    on: (event: string, listener: (value: unknown) => void) => listeners.set(event, listener),
  } as unknown as dashjs.MediaPlayerClass;
  const library = { MediaPlayer: { events } } as unknown as typeof dashjs;
  attachDashPlaybackDiagnostics(player, library);
  return listeners;
}

afterEach(() => clearClientDebugLogs());

test("records bounded DASH byte-range timing without logging the media URL", () => {
  clearClientDebugLogs();
  const listeners = playerWithListeners();
  listeners.get(events.METRIC_ADDED)?.({
    metric: "HttpList",
    value: {
      type: "MediaSegment",
      _stream: "video",
      range: "0-1499",
      responsecode: 206,
      trequest: new Date(1_000),
      tresponse: new Date(1_075),
      _tfinish: new Date(1_240),
      trace: [{ b: 1_500 }],
      url: "https://cdn.example/video?token=secret",
    } as unknown as dashjs.HTTPRequest,
  });

  const message = getClientDebugLogs()[0]?.message ?? "";
  expect(message).toContain("playback.dash_range_request");
  expect(message).toContain("requestType=MediaSegment");
  expect(message).toContain("rangeBytes=1500");
  expect(message).toContain("responseBytes=1500");
  expect(message).toContain("httpStatus=206");
  expect(message).toContain("ttfbMs=75");
  expect(message).toContain("downloadMs=165");
  expect(message).not.toContain("cdn.example");
  expect(message).not.toContain("secret");
});

test("ignores non-range metrics and caps range request records", () => {
  clearClientDebugLogs();
  const listeners = playerWithListeners();
  const record = listeners.get(events.METRIC_ADDED);
  expect(record).toBeDefined();
  record?.({ metric: "BufferLevel", value: { type: "MediaSegment", range: "0-9" } });
  record?.({ metric: "HttpList", value: { type: "MediaSegment", range: null } });

  for (let index = 0; index < 70; index += 1) {
    record?.({
      metric: "HttpList",
      value: { type: "MediaSegment", _stream: "video", range: `${index * 10}-${index * 10 + 9}` },
    });
  }

  expect(
    getClientDebugLogs().filter(({ message }) => message.includes("playback.dash_range_request")),
  ).toHaveLength(64);
});
