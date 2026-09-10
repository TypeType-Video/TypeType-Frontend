import { request } from "./api";
import { API_BASE as BASE } from "./env";

export function fetchSuggestions(
  query: string,
  service: number,
  signal?: AbortSignal,
): Promise<string[]> {
  const params = new URLSearchParams({ query, service: String(service) });
  return request(`${BASE}/suggestions?${params}`, { signal });
}
