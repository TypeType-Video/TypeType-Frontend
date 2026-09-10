import type { AccountProfile, AccountProfilesResponse, ProfileSwitchResponse } from "../types/auth";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

export function fetchAccountProfiles(): Promise<AccountProfilesResponse> {
  return authedJson(`${BASE}/profiles`);
}

export function createAccountProfile(name: string): Promise<AccountProfile> {
  return authedJson(`${BASE}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function renameAccountProfile(profileId: string, name: string): Promise<AccountProfile> {
  return authedJson(`${BASE}/profiles/${encodeURIComponent(profileId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function setDefaultAccountProfile(profileId: string): Promise<AccountProfile> {
  return authedJson(`${BASE}/profiles/${encodeURIComponent(profileId)}/default`, {
    method: "POST",
  });
}

export function switchAccountProfile(profileId: string): Promise<ProfileSwitchResponse> {
  return authedJson(`${BASE}/profiles/${encodeURIComponent(profileId)}/switch`, {
    method: "POST",
  });
}

export async function deleteAccountProfile(profileId: string): Promise<void> {
  const response = await authed(`${BASE}/profiles/${encodeURIComponent(profileId)}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) {
    throw new Error("Profile deletion failed");
  }
}
