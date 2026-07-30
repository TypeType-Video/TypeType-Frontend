import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import { hasSabrSession } from "./sabr-source";

export type DeliveredStream = {
  deliveryMethod?: string | null;
  url: string;
};

function isSabrStream(item: { deliveryMethod?: string | null }): boolean {
  return item.deliveryMethod === "sabr";
}

export function hasPlayableDirectUrl(item: DeliveredStream): boolean {
  return !isSabrStream(item) && item.url.length > 0;
}

export function directVideoOnlyStreams(stream: VideoStream): VideoStreamItem[] {
  return (stream.videoOnlyStreams ?? []).filter(hasPlayableDirectUrl);
}

export function directAudioStreams(stream: VideoStream): AudioStreamItem[] {
  return (stream.audioStreams ?? []).filter(hasPlayableDirectUrl);
}

export function directProgressiveStreams(stream: VideoStream): VideoStreamItem[] {
  return (stream.videoStreams ?? []).filter(hasPlayableDirectUrl);
}

export function hasDirectDashPair(stream: VideoStream): boolean {
  return directVideoOnlyStreams(stream).length > 0 && directAudioStreams(stream).length > 0;
}

export function hasSabrPlayback(stream: VideoStream): boolean {
  return hasSabrSession(stream);
}
