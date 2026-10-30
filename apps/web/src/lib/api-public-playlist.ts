import type { PublicPlaylistResponse } from "../types/playlist";
import {
  isBilibiliCollectionUrl,
  toCanonicalBilibiliCollectionUrl,
} from "./api-bilibili-channel-collections";
import { API_BASE as BASE } from "./env";
import { requestWithSession } from "./session-request";

export function fetchPublicPlaylist(
  url: string,
  nextpage?: string,
): Promise<PublicPlaylistResponse> {
  const targetUrl = isBilibiliCollectionUrl(url) ? toCanonicalBilibiliCollectionUrl(url) : url;
  const params = new URLSearchParams({ url: targetUrl });
  if (nextpage) params.set("nextpage", nextpage);
  return requestWithSession(`${BASE}/playlist?${params}`);
}
