import type {
  GroupedSubscription,
  MembershipChange,
  SubscriptionGroup,
} from "../types/subscription-groups";
import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE } from "./env";

const GROUPS_URL = `${API_BASE}/subscriptions/groups`;

export function fetchSubscriptionGroups(): Promise<SubscriptionGroup[]> {
  return authedJson(GROUPS_URL);
}

export function fetchGroupMemberships(): Promise<GroupedSubscription[]> {
  return authedJson(`${API_BASE}/subscriptions/group-memberships`);
}

async function groupRequest(path: string, method: string, body?: unknown): Promise<Response> {
  const response = await authed(`${GROUPS_URL}${path}`, {
    method,
    ...(body === undefined
      ? {}
      : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const error: unknown = await response.json().catch(() => null);
    const code =
      error && typeof error === "object" && "code" in error && typeof error.code === "string"
        ? error.code
        : null;
    throw new ApiError("Subscription group request failed", response.status, code);
  }
  return response;
}

export async function createSubscriptionGroup(name: string): Promise<SubscriptionGroup> {
  const response = await groupRequest("", "POST", { name: name.trim() });
  return response.json();
}

export async function renameSubscriptionGroup(id: string, name: string): Promise<void> {
  await groupRequest(`/${encodeURIComponent(id)}`, "PUT", { name: name.trim() });
}

export async function deleteSubscriptionGroup(id: string): Promise<void> {
  await groupRequest(`/${encodeURIComponent(id)}`, "DELETE");
}

export class MembershipUpdateError extends Error {
  readonly failedUrls: string[];
  constructor(failedUrls: string[]) {
    super("Some subscription group changes could not be saved");
    this.failedUrls = failedUrls;
  }
}

export async function updateGroupMemberships(changes: MembershipChange[]): Promise<void> {
  const failed = new Set<string>();
  for (const change of changes) {
    const urls = [...new Set(change.channelUrls)];
    for (let offset = 0; offset < urls.length; offset += 500) {
      const channelUrls = urls.slice(offset, offset + 500);
      try {
        await groupRequest(
          `/${encodeURIComponent(change.groupId)}/channels`,
          change.action === "add" ? "PUT" : "DELETE",
          { channelUrls },
        );
      } catch {
        for (const url of channelUrls) failed.add(url);
      }
    }
  }
  if (failed.size > 0) throw new MembershipUpdateError([...failed]);
}
