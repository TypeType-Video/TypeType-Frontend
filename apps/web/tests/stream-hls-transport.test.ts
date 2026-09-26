import { expect, test } from "bun:test";
import { createHlsPlaybackKey } from "../src/lib/hls-buffer-config";
import { isMediaHandleUrl, proxyDashManifest, proxyUrl } from "../src/lib/proxy";
import { resolveManifestSrc, shouldUseHls } from "../src/lib/stream-src";
import type { VideoStream } from "../src/types/stream";

const MEDIA_HANDLE = "/media/m1_123456789012345678901234";

test("uses only HLS for YouTube live even when DASH tracks exist", () => {
  const stream = {
    id: "https://www.youtube.com/watch?v=live123",
    hlsUrl: "/streams/hls-manifest?token=live",
    videoOnlyStreams: [{ url: "https://example.com/video.mp4" }],
    audioStreams: [{ url: "https://example.com/audio.m4a" }],
  } as VideoStream;

  expect(resolveManifestSrc(stream, true, false)).toEqual({
    src: "/api/streams/hls-manifest?token=live",
    type: "application/x-mpegurl",
  });
});

test("creates HLS playback keys without crypto.randomUUID", () => {
  const cryptoApi = {
    getRandomValues: (values: Uint32Array) => {
      values.set([1, 35, 171, 0xffffffff]);
      return values;
    },
  } as unknown as Crypto;

  expect(createHlsPlaybackKey(cryptoApi)).toBe("00000001-00000023-000000ab-ffffffff");
});

test("does not fall back to another format when live HLS is missing or failed", () => {
  const stream = {
    id: "https://www.youtube.com/watch?v=live123",
    videoStreams: [{ url: "https://example.com/video.mp4" }],
  } as VideoStream;

  expect(resolveManifestSrc(stream, true, false)).toBe("");
  expect(
    resolveManifestSrc({ ...stream, hlsUrl: "/streams/hls-manifest?token=live" }, true, false, {
      hlsFailed: true,
    }),
  ).toBe("");
});

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
  expect(new URL(proxyUrl(MEDIA_HANDLE), "https://typetype.test").pathname).toBe(
    `/api${MEDIA_HANDLE}`,
  );
  expect(new URL(proxyDashManifest(MEDIA_HANDLE), "https://typetype.test").pathname).toBe(
    `/api${MEDIA_HANDLE}`,
  );
  expect(proxyUrl(MEDIA_HANDLE)).not.toContain("/proxy?url=");
});

test("uses an absolute media handle URL in the browser", () => {
  const runtime = globalThis as typeof globalThis & {
    window?: { location: { origin: string } };
  };
  const previousWindow = runtime.window;
  Object.defineProperty(runtime, "window", {
    configurable: true,
    value: { location: { origin: "https://watch.example" } },
  });
  try {
    expect(proxyUrl(MEDIA_HANDLE)).toBe(`https://watch.example/api${MEDIA_HANDLE}`);
    expect(proxyDashManifest(MEDIA_HANDLE)).toBe(`https://watch.example/api${MEDIA_HANDLE}`);
  } finally {
    if (previousWindow === undefined) delete runtime.window;
    else runtime.window = previousWindow;
  }
});

test("does not treat signed-looking media paths with a query as handles", () => {
  expect(isMediaHandleUrl(`${MEDIA_HANDLE}?token=stale`)).toBe(false);
  expect(proxyUrl(`${MEDIA_HANDLE}?token=stale`)).toContain("/proxy?url=");
});

test("uses provider media handles as HLS sources even without a DASH pair", () => {
  expect(shouldUseHls(MEDIA_HANDLE, false, false, true)).toBe(true);
});
