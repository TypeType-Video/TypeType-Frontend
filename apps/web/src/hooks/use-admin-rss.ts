import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminRssFeeds,
  revokeAdminRssFeed,
  setAdminRssFeedEnabled,
  setAdminUserRssEnabled,
} from "../lib/api-rss";

const ADMIN_RSS_KEY = ["admin-rss-feeds"];

export function useAdminRss(enabled: boolean, page: number, limit: number) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ADMIN_RSS_KEY });
  const query = useQuery({
    queryKey: [...ADMIN_RSS_KEY, page, limit],
    queryFn: () => fetchAdminRssFeeds(page, limit),
    enabled,
  });
  const setFeedEnabled = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      setAdminRssFeedEnabled(id, value),
    onSuccess: refresh,
  });
  const setUserEnabled = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      setAdminUserRssEnabled(id, value),
    onSuccess: refresh,
  });
  const revoke = useMutation({ mutationFn: revokeAdminRssFeed, onSuccess: refresh });
  return { query, setFeedEnabled, setUserEnabled, revoke };
}
