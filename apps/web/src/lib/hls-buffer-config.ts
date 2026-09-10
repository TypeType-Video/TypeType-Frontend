import type { HlsConfig } from "hls.js";

export const HLS_BUFFER_CONFIG: Partial<HlsConfig> = {
  backBufferLength: 30,
  maxBufferLength: 10,
  maxMaxBufferLength: 10,
};
