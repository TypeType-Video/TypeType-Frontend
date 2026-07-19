import type { VideoStream } from "../types/stream";
import type { WatchLaterItem } from "../types/user";
import { proxyImage } from "./proxy";

export type WatchLaterPayload = Omit<WatchLaterItem, "addedAt">;

export function toWatchLaterPayload(stream: VideoStream): WatchLaterPayload {
  return {
    url: stream.id,
    title: stream.title,
    thumbnail: stream.rawThumbnail || stream.thumbnail,
    duration: stream.duration,
    channelName: stream.channelName || undefined,
    channelUrl: stream.channelUrl,
    channelAvatar: stream.rawChannelAvatar || stream.channelAvatar || undefined,
    viewCount: stream.views,
    publishedAt: stream.publishedAt,
  };
}

export function mapWatchLaterItem(item: WatchLaterItem): VideoStream {
  const rawChannelAvatar = item.channelAvatar ?? "";
  return {
    id: item.url,
    title: item.title,
    thumbnail: proxyImage(item.thumbnail),
    rawThumbnail: item.thumbnail,
    rawChannelAvatar,
    channelName: item.channelName ?? "",
    channelUrl: item.channelUrl || undefined,
    channelAvatar: proxyImage(rawChannelAvatar),
    views: item.viewCount ?? 0,
    duration: item.duration,
    publishedAt: item.publishedAt && item.publishedAt > 0 ? item.publishedAt : undefined,
  };
}
