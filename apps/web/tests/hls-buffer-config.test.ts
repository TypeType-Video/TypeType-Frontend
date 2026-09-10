import { describe, expect, it } from "bun:test";
import { HLS_BUFFER_CONFIG } from "../src/lib/hls-buffer-config";

describe("HLS buffer policy", () => {
  it("matches the TypeType MSE VOD policy", () => {
    expect(HLS_BUFFER_CONFIG).toEqual({
      backBufferLength: 30,
      maxBufferLength: 10,
      maxMaxBufferLength: 10,
    });
  });
});
