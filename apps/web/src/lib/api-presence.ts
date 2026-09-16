import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

export type PresenceKey = {
  id: string;
  name: string;
  tokenPrefix: string;
  scope: string;
  createdAt: number;
  lastUsedAt: number | null;
};

export type PresenceKeyCreated = {
  key: PresenceKey;
  token: string;
};

export async function fetchPresenceKeys(): Promise<PresenceKey[]> {
  const keys = await authedJson<unknown>(`${BASE}/presence/keys`);
  if (!Array.isArray(keys)) throw new ApiError("Invalid presence keys payload", 500);
  return keys as PresenceKey[];
}

export async function createPresenceKey(name: string): Promise<PresenceKeyCreated> {
  return authedJson<PresenceKeyCreated>(`${BASE}/presence/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function revokePresenceKey(id: string): Promise<void> {
  const res = await authed(`${BASE}/presence/keys/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (res.status !== 204) throw new ApiError("Failed to revoke presence key", res.status);
}
