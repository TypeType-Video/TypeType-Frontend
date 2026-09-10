import type { HlsConfig } from "hls.js";
import { isMediaHandleUrl } from "./proxy";

export function hlsRequestUrl(url: string, playbackKey: string): string {
  if (!isMediaHandleUrl(url)) return url;
  const absolute = URL.canParse(url);
  const parsed = new URL(url, "https://typetype.invalid");
  parsed.searchParams.set("playback", playbackKey);
  return absolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
}

export function createHlsConfig(playbackKey = crypto.randomUUID()): Partial<HlsConfig> {
  let requestSequence = 0;
  return {
    backBufferLength: 30,
    maxBufferLength: 10,
    maxMaxBufferLength: 10,
    xhrSetup: (xhr, url) =>
      xhr.open("GET", hlsRequestUrl(url, `${playbackKey}-${requestSequence++}`), true),
  };
}
