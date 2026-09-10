import type { HlsConfig, Loader, LoaderContext } from "hls.js";
import { isMediaHandleUrl } from "./proxy";

export function hlsRequestUrl(url: string, playbackKey: string): string {
  if (!isMediaHandleUrl(url)) return url;
  const absolute = URL.canParse(url);
  const parsed = new URL(url, "https://typetype.invalid");
  parsed.searchParams.set("playback", playbackKey);
  return absolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
}

type HlsLoader = new (config: HlsConfig) => Loader<LoaderContext>;

export function createHlsConfig(
  XhrLoader: HlsLoader,
  playbackKey = crypto.randomUUID(),
): Partial<HlsConfig> {
  class PlaybackXhrLoader extends XhrLoader {
    override load(...args: Parameters<Loader<LoaderContext>["load"]>): void {
      const [context, config, callbacks] = args;
      super.load({ ...context, url: hlsRequestUrl(context.url, playbackKey) }, config, callbacks);
    }
  }

  return {
    backBufferLength: 30,
    loader: PlaybackXhrLoader,
    maxBufferLength: 10,
    maxMaxBufferLength: 10,
  };
}
