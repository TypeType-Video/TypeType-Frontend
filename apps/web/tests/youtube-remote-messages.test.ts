import { expect, test } from "bun:test";
import {
  appendYoutubeRemoteLog,
  formatYoutubeRemoteLogs,
  MAX_REMOTE_LOG_LINES,
  parseYoutubeRemoteMessage,
} from "../src/lib/youtube-remote-messages";

test("parses status, error and log messages from the remote browser", () => {
  expect(parseYoutubeRemoteMessage('{"type":"status","phase":"awaiting_login"}')).toEqual({
    type: "status",
    phase: "awaiting_login",
  });
  expect(parseYoutubeRemoteMessage('{"type":"error","message":"Session expired"}')).toEqual({
    type: "error",
    message: "Session expired",
  });
  expect(parseYoutubeRemoteMessage('{"type":"log","at":1234.7,"message":"phase opening"}')).toEqual(
    {
      type: "log",
      at: 1234,
      message: "phase opening",
    },
  );
});

test("rejects unknown phases, malformed logs and invalid json", () => {
  expect(parseYoutubeRemoteMessage('{"type":"status","phase":"unknown"}')).toBeNull();
  expect(parseYoutubeRemoteMessage('{"type":"log","message":"missing at"}')).toBeNull();
  expect(parseYoutubeRemoteMessage("not json")).toBeNull();
});

test("keeps a bounded, readable log", () => {
  let lines = appendYoutubeRemoteLog([], { at: 0, source: "client", message: "websocket open" });
  lines = appendYoutubeRemoteLog(lines, {
    at: 1500,
    source: "token",
    message: "phase awaiting_login",
  });
  expect(formatYoutubeRemoteLogs(lines)).toBe(
    "   0.0s [client] websocket open\n   1.5s [token] phase awaiting_login",
  );
  for (let index = 0; index < MAX_REMOTE_LOG_LINES + 5; index += 1) {
    lines = appendYoutubeRemoteLog(lines, { at: index, source: "token", message: `line ${index}` });
  }
  expect(lines).toHaveLength(MAX_REMOTE_LOG_LINES);
  expect(lines[0]?.message).toBe("line 5");
});
