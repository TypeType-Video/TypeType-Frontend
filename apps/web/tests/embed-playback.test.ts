import { expect, test } from "bun:test";
import { resolveEmbedAutoplay, resolveEmbedPlaybackMode } from "../src/lib/embed-playback";

test("uses the requested autoplay value for the initial player", () => {
  expect(resolveEmbedAutoplay(0, false, true)).toBe(true);
  expect(resolveEmbedAutoplay(0, true, false)).toBe(false);
});

test("keeps requested autoplay when the first attempt fails before playback", () => {
  expect(resolveEmbedAutoplay(1, true, true)).toBe(true);
});

test("keeps the latest playback intent when retrying", () => {
  expect(resolveEmbedAutoplay(2, false, true)).toBe(false);
  expect(resolveEmbedAutoplay(2, true, false)).toBe(true);
});

test("uses SABR for framed playback", () => {
  expect(resolveEmbedPlaybackMode(true, "legacy")).toBe("sabr");
  expect(resolveEmbedPlaybackMode(true, "sabr")).toBe("sabr");
  expect(resolveEmbedPlaybackMode(false, "legacy")).toBe("legacy");
});
