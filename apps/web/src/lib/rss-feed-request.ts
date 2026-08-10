import type { RssFeedRequest } from "../types/rss";

export function isRssFeedRequestValid(request: RssFeedRequest): boolean {
  return (
    request.name.trim().length >= 1 &&
    request.name.trim().length <= 100 &&
    request.serviceIds.length > 0 &&
    (request.includeVideos ||
      request.includeShorts ||
      request.includeLive ||
      request.includeUpcoming) &&
    (request.scope !== "channels" ||
      (request.channelUrls.length >= 1 && request.channelUrls.length <= 100))
  );
}
