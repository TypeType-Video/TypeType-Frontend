import type { ChannelPlaylistsResponse } from "../types/playlist";
import { API_BASE as BASE } from "./env";
import { requestWithSession } from "./session-request";

export function fetchChannelPlaylists(
  url: string,
  nextpage?: string,
): Promise<ChannelPlaylistsResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return requestWithSession(`${BASE}/channel/playlists?${params}`);
}
