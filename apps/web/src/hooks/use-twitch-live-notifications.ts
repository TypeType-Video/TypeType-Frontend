import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchTwitchLiveNotifications,
  type TwitchLiveNotifications,
  updateTwitchLiveChannel,
  updateTwitchLiveNotifications,
} from "../lib/api-notifications";
import { fetchTwitchFollowedChannels } from "../lib/api-twitch";
import { useTwitchAccount } from "./use-twitch";

const KEY = ["notifications", "twitch-live"];

export function useTwitchLiveNotifications() {
  const linked = useTwitchAccount().data?.linked === true;
  const client = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: fetchTwitchLiveNotifications, enabled: linked });
  const update = useMutation({
    mutationFn: updateTwitchLiveNotifications,
    onSuccess: (saved) => {
      client.setQueryData<TwitchLiveNotifications>(KEY, (old) =>
        old ? { ...old, enabled: saved.enabled } : { enabled: saved.enabled, mutedChannels: [] },
      );
      void client.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  const updateChannel = useMutation({
    mutationFn: ({ login, enabled }: { login: string; enabled: boolean }) =>
      updateTwitchLiveChannel(login, enabled),
    onMutate: async ({ login, enabled }) => {
      await client.cancelQueries({ queryKey: KEY });
      const before = client.getQueryData<TwitchLiveNotifications>(KEY);
      const key = login.toLowerCase();
      client.setQueryData<TwitchLiveNotifications>(KEY, (old) =>
        old
          ? {
              ...old,
              mutedChannels: enabled
                ? old.mutedChannels.filter((muted) => muted !== key)
                : [...new Set([...old.mutedChannels, key])],
            }
          : old,
      );
      return { before };
    },
    onError: (_error, _vars, context) => client.setQueryData(KEY, context?.before),
    onSettled: () => void client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return { linked, query, update, updateChannel };
}

export function useTwitchFollowedChannelList(enabled: boolean) {
  const query = useInfiniteQuery({
    queryKey: ["twitch", "followed-channels"],
    queryFn: ({ pageParam }) => fetchTwitchFollowedChannels(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore && last.cursor ? last.cursor : undefined),
    enabled,
    staleTime: 60_000,
  });
  return { ...query, items: query.data?.pages.flatMap((page) => page.items) ?? [] };
}
