import { toAbsoluteApiUrl } from "./env";
import { finishPlaybackApiRequest, preparePlaybackApiRequest } from "./playback-trace";
import type { SabrPlaybackConfig } from "./sabr-source";

export async function prewarmSabrPlayback(
  config: SabrPlaybackConfig,
  token: string | null,
  signal: AbortSignal,
  startTimeMs = 0,
): Promise<void> {
  const params = new URLSearchParams({
    videoItag: String(config.videoItag),
    audioItag: String(config.audioItag),
    startTimeMs: String(Math.max(0, Math.round(startTimeMs))),
  });
  if (config.audioTrackId) params.set("audioTrackId", config.audioTrackId);
  if (config.audioOnly) params.set("audioOnly", "true");
  if (config.isLive) params.set("isLive", "true");
  params.set("prewarm", "true");
  const url = toAbsoluteApiUrl(`/sabr/playback/${encodeURIComponent(config.videoId)}?${params}`);
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const trace = preparePlaybackApiRequest(url, {
    method: "POST",
    headers,
    signal,
    cache: "no-store",
  });
  let response: Response;
  try {
    response = await fetch(url, trace.init);
  } catch (error) {
    finishPlaybackApiRequest(trace, 0, "network_error");
    throw error;
  }
  finishPlaybackApiRequest(trace, response.status, response.ok ? "ok" : "http_error");
  if (!response.ok) throw new Error(`SABR prewarm failed with status ${response.status}`);
}
