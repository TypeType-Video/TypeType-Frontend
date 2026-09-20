import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

type BiliBiliSessionStatus = "disconnected" | "connected" | "needs_reconnect";

export type BiliBiliSessionState = {
  status: BiliBiliSessionStatus;
  updatedAt: number;
  lastUsedAt: number;
  expiresAt?: number;
};

export type BiliBiliQrLogin = {
  qrUrl: string;
  qrcodeKey: string;
  expiresAt: number;
};

export type BiliBiliQrPollState = {
  status: "waiting" | "scanned" | "confirmed" | "expired" | "error";
  message?: string;
};

export function fetchBiliBiliSessionStatus(): Promise<BiliBiliSessionState> {
  return authedJson(`${BASE}/bilibili-session/status`);
}

export function startBiliBiliQrLogin(): Promise<BiliBiliQrLogin> {
  return authedJson(`${BASE}/bilibili-session/qr`, { method: "POST" });
}

export function pollBiliBiliQrLogin(qrcodeKey: string): Promise<BiliBiliQrPollState> {
  return authedJson(`${BASE}/bilibili-session/qr/poll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrcodeKey }),
  });
}

export async function disconnectBiliBiliSession(): Promise<void> {
  const res = await authed(`${BASE}/bilibili-session`, { method: "DELETE" });
  if (!res.ok) throw new ApiError("Failed to disconnect BiliBili session", res.status);
}
