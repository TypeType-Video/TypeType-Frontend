import { type UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ApiError } from "../lib/api";
import {
  fetchGroupMemberships,
  fetchSubscriptionGroups,
  MembershipUpdateError,
} from "../lib/api-subscription-groups";
import { m } from "../paraglide/messages.js";
import type { GroupedSubscription, SubscriptionGroup } from "../types/subscription-groups";
import { useAuth } from "./use-auth";

const GROUPS_KEY = ["subscription-groups"];
const GROUP_MEMBERSHIPS_KEY = ["subscription-group-memberships"];

export function useSubscriptionGroups(): UseQueryResult<SubscriptionGroup[]> {
  const { authReady, isAuthed, me } = useAuth();
  return useQuery({
    queryKey: [...GROUPS_KEY, me?.id],
    queryFn: fetchSubscriptionGroups,
    enabled: authReady && isAuthed,
    staleTime: 60_000,
  });
}

export function useGroupMemberships(): UseQueryResult<GroupedSubscription[]> {
  const { authReady, isAuthed, me } = useAuth();
  return useQuery({
    queryKey: [...GROUP_MEMBERSHIPS_KEY, me?.id],
    queryFn: fetchGroupMemberships,
    enabled: authReady && isAuthed,
    staleTime: 60_000,
  });
}

type GroupActions = {
  busy: boolean;
  error: string | null;
  notice: string | null;
  clearError: () => void;
  run: (action: () => Promise<unknown>, success: string) => Promise<boolean>;
};

export function useGroupActions(): GroupActions {
  const client = useQueryClient();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>, success: string): Promise<boolean> {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    let succeeded = false;
    try {
      await action();
      succeeded = true;
      setNotice(success);
    } catch (cause) {
      setError(
        cause instanceof MembershipUpdateError
          ? cause.failedUrls.length === 1
            ? m.sg_partial_one_failure()
            : m.sg_partial_failure({ count: cause.failedUrls.length })
          : cause instanceof ApiError && cause.code === "subscription_group_name_conflict"
            ? m.sg_duplicate_name()
            : cause instanceof ApiError && cause.code === "subscription_group_invalid_name"
              ? m.sg_invalid_name()
              : m.sg_save_error(),
      );
    } finally {
      await Promise.all(
        [GROUPS_KEY, GROUP_MEMBERSHIPS_KEY, ["subscriptions"], ["subscription-feed"]].map(
          (queryKey) => client.invalidateQueries({ queryKey }),
        ),
      );
      lock.current = false;
      setBusy(false);
    }
    return succeeded;
  }

  return { busy, error, notice, clearError: () => setError(null), run };
}
