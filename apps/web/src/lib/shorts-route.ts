import type { VideoStream } from "../types/stream";
import { detectProvider } from "./provider";
import { toPublicWatchParam, toWatchSourceUrl, youtubeThumbnailUrl } from "./watch-url";

export type ShortsRouteTarget = {
  publicParam: string;
  sourceUrl: string;
};

export function resolveShortsRouteTarget(value: string | undefined): ShortsRouteTarget | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const sourceUrl = toWatchSourceUrl(trimmed);
  if (detectProvider(sourceUrl) === "unknown") return null;
  const publicParam = toPublicWatchParam(sourceUrl);
  return { publicParam, sourceUrl: toWatchSourceUrl(publicParam) };
}

export function shortsRouteKey(value: string): string {
  return resolveShortsRouteTarget(value)?.publicParam ?? value.trim();
}

export function createShortsRouteEntry(value: string | undefined): VideoStream | null {
  const target = resolveShortsRouteTarget(value);
  if (!target) return null;
  const thumbnail = youtubeThumbnailUrl(target.sourceUrl) ?? "";
  return {
    id: target.sourceUrl,
    title: "",
    thumbnail,
    rawThumbnail: thumbnail,
    rawChannelAvatar: "",
    channelName: "",
    channelAvatar: "",
    views: 0,
    duration: 0,
    isShortFormContent: true,
  };
}

export function mergeShortsRouteEntries(
  entries: VideoStream[],
  feed: VideoStream[],
): VideoStream[] {
  const feedByKey = new Map(feed.map((stream) => [shortsRouteKey(stream.id), stream]));
  const seen = new Set<string>();
  const merged: VideoStream[] = [];
  for (const entry of entries) {
    const key = shortsRouteKey(entry.id);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(feedByKey.get(key) ?? entry);
  }
  for (const stream of feed) {
    const key = shortsRouteKey(stream.id);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(stream);
  }
  return merged;
}

export function toPublicShortsUrl(sourceUrl: string, origin: string): string {
  const url = new URL("/shorts", origin);
  url.searchParams.set("v", shortsRouteKey(sourceUrl));
  return url.toString();
}
