import { expect, test } from "bun:test";
import { shouldUseHls } from "../src/lib/stream-src";

test("uses HLS when DASH is unavailable", () => {
  expect(shouldUseHls("https://example.com/master.m3u8", false, false, false)).toBe(true);
});

test("keeps DASH ahead of unsigned HLS", () => {
  expect(shouldUseHls("https://example.com/master.m3u8", false, false, true)).toBe(false);
});

test("does not retry failed HLS", () => {
  expect(shouldUseHls("https://example.com/master.m3u8", false, true, false)).toBe(false);
});
