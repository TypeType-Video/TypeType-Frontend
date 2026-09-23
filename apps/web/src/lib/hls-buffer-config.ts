import type { HlsConfig } from "hls.js";
import { isMediaHandleUrl } from "./proxy";

export function hlsRequestUrl(url: string, playbackKey: string): string {
  if (!isMediaHandleUrl(url)) return url;
  const absolute = URL.canParse(url);
  const parsed = new URL(url, "https://typetype.invalid");
  parsed.searchParams.set("playback", playbackKey);
  return absolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
}

type HlsLoader = HlsConfig["loader"];

export function createHlsConfig(
  FetchLoader: HlsLoader,
  playbackKey = createHlsPlaybackKey(),
): Partial<HlsConfig> {
  let requestSequence = 0;
  return {
    backBufferLength: 30,
    fetchSetup: (context, initParams) =>
      new Request(hlsRequestUrl(context.url, `${playbackKey}-${requestSequence++}`), initParams),
    loader: FetchLoader,
    maxBufferLength: 10,
    maxMaxBufferLength: 10,
  };
}

export function createHlsPlaybackKey(cryptoApi: Crypto | undefined = globalThis.crypto): string {
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  if (typeof cryptoApi?.getRandomValues === "function") {
    return Array.from(cryptoApi.getRandomValues(new Uint32Array(4)), (value) =>
      value.toString(16).padStart(8, "0"),
    ).join("-");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
