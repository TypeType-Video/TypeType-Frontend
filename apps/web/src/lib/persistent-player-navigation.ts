import { toPublicWatchParam, toWatchSourceUrl } from "./watch-url";

export function shouldKeepPersistentPlayerForRoute(
  streamId: string,
  locationHref: string,
): boolean {
  const location = new URL(locationHref, "http://typetype.local");
  if (location.pathname !== "/watch") return true;

  const requestedVideo = location.searchParams.get("v")?.trim();
  if (!requestedVideo) return false;

  return (
    toPublicWatchParam(streamId) === toPublicWatchParam(toWatchSourceUrl(requestedVideo))
  );
}
