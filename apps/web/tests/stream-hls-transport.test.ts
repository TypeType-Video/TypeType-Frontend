import { expect, test } from "bun:test";
import { isMediaHandleUrl, proxyDashManifest, proxyUrl } from "../src/lib/proxy";
import { shouldUseHls } from "../src/lib/stream-src";

const MEDIA_HANDLE = "/media/m1_123456789012345678901234";

test("uses HLS when DASH is unavailable", () => {
  expect(shouldUseHls("https://example.com/master.m3u8", false, false, false)).toBe(true);
});

test("keeps DASH ahead of unsigned HLS", () => {
  expect(shouldUseHls("https://example.com/master.m3u8", false, false, true)).toBe(false);
});

test("does not retry failed HLS", () => {
  expect(shouldUseHls("https://example.com/master.m3u8", false, true, false)).toBe(false);
});

test("keeps opaque provider media handles out of the generic proxy", () => {
  expect(isMediaHandleUrl(MEDIA_HANDLE)).toBe(true);
  expect(proxyUrl(MEDIA_HANDLE)).toBe(`/api${MEDIA_HANDLE}`);
  expect(proxyDashManifest(MEDIA_HANDLE)).toBe(`/api${MEDIA_HANDLE}`);
  expect(proxyUrl(MEDIA_HANDLE)).not.toContain("/proxy?url=");
});

test("does not treat signed-looking media paths with a query as handles", () => {
  expect(isMediaHandleUrl(`${MEDIA_HANDLE}?token=stale`)).toBe(false);
  expect(proxyUrl(`${MEDIA_HANDLE}?token=stale`)).toContain("/proxy?url=");
});

test("uses provider media handles as HLS sources even without a DASH pair", () => {
  expect(shouldUseHls(MEDIA_HANDLE, false, false, true)).toBe(true);
});
