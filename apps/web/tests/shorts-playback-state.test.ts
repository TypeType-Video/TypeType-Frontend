import { describe, expect, test } from "bun:test";
import { shortsPlaybackSourceKind, shortsPlaybackState } from "../src/lib/shorts-playback-state";

const readyInput = {
  loading: false,
  queryError: false,
  hasStream: true,
  hasPlaybackSource: true,
  playbackError: false,
};

describe("shortsPlaybackState", () => {
  test("never falls back to a manifest for YouTube Shorts", () => {
    expect(shortsPlaybackSourceKind("youtube", false, true)).toBeNull();
    expect(shortsPlaybackSourceKind("youtube", true, true)).toBe("sabr");
  });

  test("preserves manifest playback for other providers", () => {
    expect(shortsPlaybackSourceKind("nicovideo", false, true)).toBe("manifest");
    expect(shortsPlaybackSourceKind("bilibili", false, true)).toBe("manifest");
  });

  test("requires a playback source before playback", () => {
    expect(shortsPlaybackState({ ...readyInput, hasPlaybackSource: false })).toBe(
      "source-unavailable",
    );
    expect(shortsPlaybackState(readyInput)).toBe("ready");
  });

  test("keeps playback failures visible instead of advancing", () => {
    expect(shortsPlaybackState({ ...readyInput, playbackError: true })).toBe("playback-error");
  });

  test("prioritizes extraction errors over loading", () => {
    expect(shortsPlaybackState({ ...readyInput, loading: true, queryError: true })).toBe(
      "query-error",
    );
  });
});
