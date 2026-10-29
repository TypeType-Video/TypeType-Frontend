import { apiErrorFromResponse } from "./api";
import { authed } from "./authed";
import { API_BASE as BASE } from "./env";

export type DeviceLinkRequest = {
  userCode: string;
  deviceName: string;
  requestedAt: number;
  expiresAt: number;
};

const EXPECTED_STATUSES = [403, 404, 409, 429];

async function send(path: string, init?: RequestInit): Promise<Response> {
  const response = await authed(`${BASE}${path}`, init, { silentStatuses: EXPECTED_STATUSES });
  if (!response.ok) throw apiErrorFromResponse(response, await response.json().catch(() => null));
  return response;
}

export async function lookupDeviceLink(userCode: string): Promise<DeviceLinkRequest> {
  const response = await send(`/auth/device/lookup?code=${encodeURIComponent(userCode)}`);
  return (await response.json()) as DeviceLinkRequest;
}

function decide(path: string, userCode: string): Promise<Response> {
  return send(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userCode }),
  });
}

export async function approveDeviceLink(userCode: string): Promise<void> {
  await decide("/auth/device/approve", userCode);
}

export async function denyDeviceLink(userCode: string): Promise<void> {
  await decide("/auth/device/deny", userCode);
}
