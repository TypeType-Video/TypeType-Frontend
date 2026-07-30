export type ShortsPlaybackState =
  | "loading"
  | "query-error"
  | "source-unavailable"
  | "playback-error"
  | "ready";

export type ShortsPlaybackSourceKind = "sabr" | "manifest";

type Input = {
  loading: boolean;
  queryError: boolean;
  hasStream: boolean;
  hasPlaybackSource: boolean;
  playbackError: boolean;
};

export function shortsPlaybackSourceKind(
  provider: "youtube" | "nicovideo" | "bilibili" | "unknown",
  hasSabrConfig: boolean,
  hasManifestSource: boolean,
): ShortsPlaybackSourceKind | null {
  if (provider === "youtube") return hasSabrConfig ? "sabr" : null;
  return hasManifestSource ? "manifest" : null;
}

export function shortsPlaybackState({
  loading,
  queryError,
  hasStream,
  hasPlaybackSource,
  playbackError,
}: Input): ShortsPlaybackState {
  if (queryError) return "query-error";
  if (playbackError) return "playback-error";
  if (loading || !hasStream) return "loading";
  if (!hasPlaybackSource) return "source-unavailable";
  return "ready";
}
