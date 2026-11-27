import type { VideoStream } from "../types/stream";
import type { TwitchVideo } from "../types/twitch";
import { proxyImage } from "./proxy";
import { twitchVodProgressUrl } from "./twitch-vod-progress-url";

const TWITCH_VIDEO_URL = /^https?:\/\/(?:www\.|m\.)?twitch\.tv\/videos\/(\d{1,20})(?:[/?#]|$)/i;

export function twitchVideoIdFromUrl(url: string): string | null {
  return TWITCH_VIDEO_URL.exec(url.trim())?.[1] ?? null;
}

export function twitchVideoStream(video: TwitchVideo): VideoStream {
  const createdAt = Date.parse(video.createdAt);
  return {
    id: twitchVodProgressUrl(video.id),
    title: video.title,
    thumbnail: proxyImage(video.previewUrl),
    rawThumbnail: video.previewUrl,
    rawChannelAvatar: video.owner.avatarUrl,
    channelName: video.owner.displayName || video.owner.login,
    channelUrl: `https://www.twitch.tv/${video.owner.login}`,
    channelAvatar: proxyImage(video.owner.avatarUrl),
    views: video.views,
    duration: video.lengthSeconds,
    publishedAt: Number.isFinite(createdAt) ? createdAt : undefined,
  };
}
