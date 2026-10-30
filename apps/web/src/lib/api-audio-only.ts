import { ApiError } from "./api";
import { API_BASE as BASE, toApiUrl } from "./env";
import { requestWithSession } from "./session-request";
import type { MediaSrc } from "./vidstack";

export type AudioOnlyResponse = {
  kind?: "progressive" | "hls" | "dash";
  src: string;
  mimeType: string;
  codec: string | null;
  bitrate: number | null;
  contentLength: number | null;
  duration: number | null;
};

export function fetchAudioOnlyStream(
  url: string,
  preferOriginal: boolean,
  preferredLocale: string,
): Promise<AudioOnlyResponse> {
  const params = new URLSearchParams({
    url,
    preferOriginal: String(preferOriginal),
    preferredLocale,
  });
  return requestWithSession<AudioOnlyResponse>(`${BASE}/streams/audio-only?${params}`, {
    cache: "no-store",
  });
}

export function toAudioOnlyMediaSrc(response: AudioOnlyResponse): MediaSrc | null {
  if (response.kind === "hls" || response.mimeType.includes("mpegurl")) {
    return { src: toApiUrl(response.src), type: "application/x-mpegurl" };
  }
  if (response.kind === "dash" || response.mimeType.includes("dash+xml")) {
    return { src: toApiUrl(response.src), type: "application/dash+xml" };
  }
  if (response.kind !== undefined && response.kind !== "progressive") {
    return null;
  }
  if (response.mimeType.includes("webm")) {
    return { src: toApiUrl(response.src), type: "audio/webm" };
  }
  if (response.mimeType.includes("audio/mp4")) {
    return toApiUrl(response.src);
  }
  return null;
}

export function isAudioOnlyUnavailable(error: unknown): boolean {
  return error instanceof ApiError && error.status === 422;
}
