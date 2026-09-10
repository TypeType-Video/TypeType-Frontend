import { describe, expect, it } from "bun:test";
import { createHlsConfig, hlsRequestUrl } from "../src/lib/hls-buffer-config";

describe("HLS buffer policy", () => {
  it("matches the TypeType MSE VOD policy", () => {
    expect(createHlsConfig("generation-1")).toMatchObject({
      backBufferLength: 30,
      maxBufferLength: 10,
      maxMaxBufferLength: 10,
    });
  });

  it("isolates opaque media handles by playback generation", () => {
    const handle = "m1_0123456789abcdefghijklmn";
    expect(hlsRequestUrl(`https://example.test/api/media/${handle}`, "generation 1")).toBe(
      `https://example.test/api/media/${handle}?playback=generation+1`,
    );
    expect(hlsRequestUrl("https://example.test/video.m3u8", "generation-1")).toBe(
      "https://example.test/video.m3u8",
    );
  });
});
