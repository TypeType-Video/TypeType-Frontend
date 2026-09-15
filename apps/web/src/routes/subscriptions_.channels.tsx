import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SubscriptionChannelList } from "../components/subscription-channel-list";
import { SubscriptionGroupFilter } from "../components/subscription-group-filter";
import { SubscriptionsHeader } from "../components/subscriptions-header";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { SUBSCRIPTION_FEED_KEY } from "../hooks/use-subscription-feed";
import { SUBSCRIPTIONS_KEY, useSubscriptions } from "../hooks/use-subscriptions";
import { fetchFilteredSubscriptions } from "../lib/api-subscription-groups";
import { fetchSubscriptionFeed, fetchSubscriptions } from "../lib/api-user";
import { m } from "../paraglide/messages.js";

const SUBSCRIPTION_STALE_MS = 5 * 60 * 1000;

function nextSubscriptionPage(last: Awaited<ReturnType<typeof fetchSubscriptionFeed>>) {
  return last.nextpage ?? undefined;
}

function SubscriptionChannelsPage() {
  const queryClient = useQueryClient();
  const { group = "all" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { query } = useSubscriptions(group);
  const { isChannelIdentityBlocked } = useBlockedFilter();
  const subscriptions = (query.data ?? []).filter(
    (item) => !isChannelIdentityBlocked({ url: item.channelUrl, name: item.name }),
  );

  function prefetchChannels() {
    void queryClient.prefetchQuery({
      queryKey: group === "all" ? SUBSCRIPTIONS_KEY : [...SUBSCRIPTIONS_KEY, group],
      queryFn: () => (group === "all" ? fetchSubscriptions() : fetchFilteredSubscriptions(group)),
      staleTime: SUBSCRIPTION_STALE_MS,
    });
  }

  function prefetchVideos() {
    void queryClient.prefetchInfiniteQuery({
      queryKey: group === "all" ? SUBSCRIPTION_FEED_KEY : [...SUBSCRIPTION_FEED_KEY, group],
      queryFn: ({ pageParam, signal }) =>
        fetchSubscriptionFeed(pageParam as string | null, signal, group),
      initialPageParam: null as string | null,
      getNextPageParam: nextSubscriptionPage,
      staleTime: SUBSCRIPTION_STALE_MS,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <SubscriptionsHeader
        active="channels"
        count={subscriptions.length}
        group={group}
        onVideosIntent={prefetchVideos}
        onChannelsIntent={prefetchChannels}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubscriptionGroupFilter
          value={group}
          onChange={(value) => void navigate({ search: { group: value } })}
        />
        <Link
          to="/subscriptions/groups"
          className="inline-flex h-9 items-center border border-border-strong px-3 text-sm hover:bg-surface"
        >
          {m.sg_manage_groups()}
        </Link>
      </div>
      {query.isLoading ? (
        <VideoGridSkeleton idPrefix="subscription-channels" />
      ) : query.isError ? (
        <p role="alert" className="py-10 text-center text-sm text-fg-muted">
          {m.sg_load_error()}
        </p>
      ) : subscriptions.length === 0 ? (
        <p className="py-10 text-center text-sm text-fg-muted">{m.sg_no_channel_match()}</p>
      ) : (
        <SubscriptionChannelList subscriptions={subscriptions} />
      )}
    </div>
  );
}

export const Route = createFileRoute("/subscriptions_/channels")({
  validateSearch: (search: Record<string, unknown>): { group?: string } => ({
    group: typeof search.group === "string" && search.group ? search.group : "all",
  }),
  component: SubscriptionChannelsPage,
});
