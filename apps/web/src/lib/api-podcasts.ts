import type { PodcastEpisodesResponse, PodcastPageResponse } from "../types/api";
import { API_BASE as BASE } from "./env";
import { requestWithSession } from "./session-request";

export function fetchPodcasts(url: string, nextpage?: string): Promise<PodcastPageResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return requestWithSession(`${BASE}/podcasts?${params}`);
}

export function fetchPodcastEpisodes(
  url: string,
  nextpage?: string,
): Promise<PodcastEpisodesResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return requestWithSession(`${BASE}/podcasts/episodes?${params}`);
}
