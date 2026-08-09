import type {
  AdminRssFeedsPage,
  RssFeedItem,
  RssFeedRequest,
  RssFeedSecretItem,
} from "../types/rss";
import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function fetchRssFeeds(): Promise<RssFeedItem[]> {
  return authedJson(`${BASE}/rss/feeds`);
}

export function createRssFeed(request: RssFeedRequest): Promise<RssFeedSecretItem> {
  return authedJson(`${BASE}/rss/feeds`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(request),
  });
}

export function updateRssFeed(id: string, request: RssFeedRequest): Promise<RssFeedItem> {
  return authedJson(`${BASE}/rss/feeds/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(request),
  });
}

export function setRssFeedEnabled(id: string, enabled: boolean): Promise<RssFeedItem> {
  return authedJson(`${BASE}/rss/feeds/${encodeURIComponent(id)}/enabled`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ enabled }),
  });
}

export function regenerateRssFeed(id: string): Promise<RssFeedSecretItem> {
  return authedJson(`${BASE}/rss/feeds/${encodeURIComponent(id)}/regenerate`, {
    method: "POST",
  });
}

export async function deleteRssFeed(id: string): Promise<void> {
  const response = await authed(`${BASE}/rss/feeds/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (response.status !== 204) throw await responseError(response, "Unable to delete RSS feed");
}

export function fetchAdminRssFeeds(page: number, limit: number): Promise<AdminRssFeedsPage> {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });
  return authedJson(`${BASE}/admin/rss/feeds?${search}`);
}

export function setAdminRssFeedEnabled(id: string, enabled: boolean): Promise<RssFeedItem> {
  return authedJson(`${BASE}/admin/rss/feeds/${encodeURIComponent(id)}/enabled`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ enabled }),
  });
}

export async function revokeAdminRssFeed(id: string): Promise<void> {
  const response = await authed(`${BASE}/admin/rss/feeds/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (response.status !== 204) throw await responseError(response, "Unable to revoke RSS feed");
}

export async function setAdminUserRssEnabled(id: string, enabled: boolean): Promise<void> {
  const response = await authed(`${BASE}/admin/rss/users/${encodeURIComponent(id)}/enabled`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ enabled }),
  });
  if (response.status !== 204) throw await responseError(response, "Unable to update account RSS");
}

async function responseError(response: Response, fallback: string): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return new ApiError(typeof body?.error === "string" ? body.error : fallback, response.status);
}
