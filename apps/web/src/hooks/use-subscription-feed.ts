import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { ApiError } from "../lib/api";
import { fetchSubscriptionFeed } from "../lib/api-user";
import { mapVideoItem } from "../lib/mappers";
import { proxyImage } from "../lib/proxy";
import type { VideoStream } from "../types/stream";
import { useAuth } from "./use-auth";
import { useSubscriptions } from "./use-subscriptions";

export const SUBSCRIPTION_FEED_KEY = ["subscription-feed"];

type Result = {
  streams: VideoStream[];
  isLoading: boolean;
  isLoadingError: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
};

export function useSubscriptionFeed(filter = "all"): Result {
  const { authReady, isAuthed } = useAuth();
  const { query: subsQuery } = useSubscriptions();
  const queryClient = useQueryClient();
  const avatarMap = useMemo(
    () => new Map((subsQuery.data ?? []).map((s) => [s.channelUrl, proxyImage(s.avatarUrl)])),
    [subsQuery.data],
  );

  const query = useInfiniteQuery({
    queryKey: filter === "all" ? SUBSCRIPTION_FEED_KEY : [...SUBSCRIPTION_FEED_KEY, filter],
    queryFn: ({ pageParam, signal }) =>
      fetchSubscriptionFeed(pageParam as string | null, signal, filter),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextpage ?? undefined,
    staleTime: 5 * 60 * 1000,
    enabled: authReady && isAuthed,
  });

  useEffect(() => {
    if (
      query.error instanceof ApiError &&
      ["subscription_feed_invalid_cursor", "subscription_feed_stale_generation"].includes(
        query.error.code ?? "",
      )
    ) {
      void queryClient.resetQueries({
        queryKey: filter === "all" ? SUBSCRIPTION_FEED_KEY : [...SUBSCRIPTION_FEED_KEY, filter],
        exact: true,
      });
    }
  }, [query.error, queryClient, filter]);

  const streams = useMemo(
    () =>
      (query.data?.pages ?? [])
        .flatMap((page) => page.videos)
        .map((video) => {
          const mapped = mapVideoItem(video);
          if (!mapped.channelAvatar && mapped.channelUrl) {
            const avatar = avatarMap.get(mapped.channelUrl);
            if (avatar) return { ...mapped, channelAvatar: avatar };
          }
          return mapped;
        }),
    [query.data, avatarMap],
  );

  return {
    streams,
    isLoading: query.isLoading,
    isLoadingError: query.isLoadingError,
    isFetchNextPageError: query.isFetchNextPageError,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
