import { describe, expect, it } from "bun:test";
import { createHlsConfig, hlsRequestUrl } from "../src/lib/hls-buffer-config";

describe("HLS buffer policy", () => {
  it("matches the TypeType MSE VOD policy", () => {
    expect(createHlsConfig(class {} as never, "generation-1")).toMatchObject({
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

  it("updates the loader context before the request starts", () => {
    class RecordingLoader {
      loadedUrl = "";
      load(context: { url: string }) {
        this.loadedUrl = context.url;
      }
    }
    const config = createHlsConfig(RecordingLoader as never, "generation-1");
    const Loader = config.loader;
    if (!Loader) throw new Error("HLS loader is missing");
    const loader = new Loader({} as never) as unknown as RecordingLoader;
    loader.load({ url: "/api/media/m1_0123456789abcdefghijklmn" });
    expect(loader.loadedUrl).toBe("/api/media/m1_0123456789abcdefghijklmn?playback=generation-1");
  });
});
