import { useAuthStore } from "../stores/auth-store";
import { ApiError, request } from "./api";
import { refreshUnauthorizedSession } from "./authed";
import { sanitizeRequestPath } from "./debug-sanitize";

function withBearer(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

export async function requestWithSession<T>(url: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  if (!token) return request<T>(url, init);
  try {
    return await request<T>(url, withBearer(init, token));
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const method = init?.method ?? "GET";
    const freshToken = await refreshUnauthorizedSession(method, sanitizeRequestPath(url));
    return request<T>(url, withBearer(init, freshToken));
  }
}
