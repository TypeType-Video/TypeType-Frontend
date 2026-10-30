import type { BulletCommentsPageResponse } from "../types/api";
import { API_BASE as BASE } from "./env";
import { requestWithSession } from "./session-request";

export function fetchBulletComments(url: string): Promise<BulletCommentsPageResponse> {
  return requestWithSession(`${BASE}/bullet-comments?url=${encodeURIComponent(url)}`);
}
