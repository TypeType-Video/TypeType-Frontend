import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRssFeed,
  deleteRssFeed,
  fetchRssFeeds,
  regenerateRssFeed,
  setRssFeedEnabled,
  updateRssFeed,
} from "../lib/api-rss";
import type { RssFeedRequest } from "../types/rss";

const RSS_FEEDS_KEY = ["rss-feeds"];

export function useRssFeeds(enabled: boolean) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: RSS_FEEDS_KEY });
  const query = useQuery({ queryKey: RSS_FEEDS_KEY, queryFn: fetchRssFeeds, enabled });
  const create = useMutation({ mutationFn: createRssFeed, onSuccess: refresh });
  const update = useMutation({
    mutationFn: ({ id, request }: { id: string; request: RssFeedRequest }) =>
      updateRssFeed(id, request),
    onSuccess: refresh,
  });
  const setEnabled = useMutation({
    mutationFn: ({ id, enabled: next }: { id: string; enabled: boolean }) =>
      setRssFeedEnabled(id, next),
    onSuccess: refresh,
  });
  const regenerate = useMutation({ mutationFn: regenerateRssFeed, onSuccess: refresh });
  const remove = useMutation({ mutationFn: deleteRssFeed, onSuccess: refresh });
  return { query, create, update, setEnabled, regenerate, remove };
}
