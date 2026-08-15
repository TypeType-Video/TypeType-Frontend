import { describe, expect, test } from "bun:test";
import {
  sanitizeYoutubeSessionReturnTo,
  youtubeSessionReturnToForShorts,
} from "../src/lib/youtube-session-route";

if (!("localStorage" in globalThis)) {
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  });
}

const { ApiError } = await import("../src/lib/api");
const { isYoutubeSessionActionError } = await import("../src/lib/api-youtube-session");

describe("YouTube session errors", () => {
  test("recognizes missing and expired YouTube sessions", () => {
    expect(
      isYoutubeSessionActionError(new ApiError("Connect YouTube", 400, "youtube_session_required")),
    ).toBe(true);
    expect(
      isYoutubeSessionActionError(
        new ApiError("Reconnect YouTube", 400, "youtube_session_needs_reconnect"),
      ),
    ).toBe(true);
  });

  test("does not turn playback failures into account actions", () => {
    expect(isYoutubeSessionActionError(new ApiError("SABR failed", 422, "sabr_failed"))).toBe(
      false,
    );
    expect(isYoutubeSessionActionError(new TypeError("Network error"))).toBe(false);
  });
});

describe("YouTube session return routes", () => {
  test("keeps a Shorts target through YouTube connection", () => {
    const returnTo = youtubeSessionReturnToForShorts("video-id");
    expect(returnTo).toBe("/shorts?v=video-id");
    expect(sanitizeYoutubeSessionReturnTo(returnTo)).toBe(returnTo);
  });

  test("rejects unrelated and external routes", () => {
    expect(sanitizeYoutubeSessionReturnTo("/settings?v=video-id")).toBeUndefined();
    expect(sanitizeYoutubeSessionReturnTo("https://example.com/watch?v=video-id")).toBeUndefined();
  });
});
