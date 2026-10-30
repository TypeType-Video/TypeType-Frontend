import { getLocale } from "../paraglide/runtime.js";
import type { HomeRecommendationsResponse } from "../types/api";
import { clientTimezone } from "./client-timezone";
import { API_BASE as BASE } from "./env";
import { requestWithSession } from "./session-request";

export type RecommendationIntent = "quick" | "deep" | "auto";

export async function fetchHomeRecommendations(
  service: number,
  limit: number,
  cursor?: string,
  intent: RecommendationIntent = "auto",
): Promise<HomeRecommendationsResponse> {
  const search = new URLSearchParams({
    service: String(service),
    limit: String(limit),
    intent,
    locale: getLocale(),
    timezone: clientTimezone(),
  });
  if (cursor) search.set("cursor", cursor);
  return requestWithSession(`${BASE}/recommendations/home?${search.toString()}`);
}

export async function fetchShortsRecommendations(
  service: number,
  limit: number,
  cursor?: string,
  intent: RecommendationIntent = "quick",
): Promise<HomeRecommendationsResponse> {
  const search = new URLSearchParams({
    service: String(service),
    limit: String(limit),
    intent,
  });
  if (cursor) search.set("cursor", cursor);
  return requestWithSession(`${BASE}/recommendations/shorts?${search.toString()}`);
}
