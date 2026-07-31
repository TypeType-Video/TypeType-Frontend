import { useEffect, useMemo, useState } from "react";
import {
  createShortsRouteEntry,
  mergeShortsRouteEntries,
  shortsRouteKey,
} from "../lib/shorts-route";
import type { VideoStream } from "../types/stream";

export function useShortsRouteFeed(feed: VideoStream[], targetUrl: string | undefined) {
  const [routeEntries, setRouteEntries] = useState<VideoStream[]>(() => {
    const entry = createShortsRouteEntry(targetUrl);
    return entry ? [entry] : [];
  });

  useEffect(() => {
    const entry = createShortsRouteEntry(targetUrl);
    if (!entry) return;
    setRouteEntries((current) => {
      const key = shortsRouteKey(entry.id);
      return current.some((item) => shortsRouteKey(item.id) === key)
        ? current
        : [...current, entry];
    });
  }, [targetUrl]);

  return useMemo(() => mergeShortsRouteEntries(routeEntries, feed), [routeEntries, feed]);
}
