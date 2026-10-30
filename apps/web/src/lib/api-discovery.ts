import type { ChannelResponse, SearchFiltersResponse, SearchPageResponse } from "../types/api";
import { API_BASE as BASE } from "./env";
import { requestWithSession } from "./session-request";

export type ChannelSort = "latest" | "popular" | "oldest";

export function fetchSearchFilters(
  service: number,
  contentFilter?: string,
  signal?: AbortSignal,
): Promise<SearchFiltersResponse> {
  const params = new URLSearchParams({ service: String(service) });
  if (contentFilter) params.set("contentFilter", contentFilter);
  return requestWithSession(`${BASE}/search/filters?${params}`, { signal });
}

export function fetchSearch(
  q: string,
  service: number,
  nextpage?: string,
  contentFilter?: string,
  filters: readonly string[] = [],
  signal?: AbortSignal,
): Promise<SearchPageResponse> {
  const params = new URLSearchParams({ q, service: String(service) });
  if (nextpage) params.set("nextpage", nextpage);
  if (contentFilter) params.set("contentFilter", contentFilter);
  for (const filter of filters) params.append("filter", filter);
  return requestWithSession(`${BASE}/search?${params}`, { signal });
}

export function fetchChannel(
  url: string,
  nextpage?: string,
  sort?: ChannelSort,
): Promise<ChannelResponse> {
  const endpoint = `${BASE}/channel/page`;
  const init = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, nextpage: nextpage ?? null, sort: sort ?? null }),
  };
  return requestWithSession<ChannelResponse>(endpoint, init);
}
