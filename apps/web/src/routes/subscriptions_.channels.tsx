import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SubscriptionChannelList } from "../components/subscription-channel-list";
import { SubscriptionGroupFilter } from "../components/subscription-group-filter";
import { SubscriptionsHeader } from "../components/subscriptions-header";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useSubscriptions } from "../hooks/use-subscriptions";
import {
  subscriptionFeedQueryOptions,
  subscriptionsQueryOptions,
} from "../lib/subscription-queries";
import { m } from "../paraglide/messages.js";

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
    void queryClient.prefetchQuery(subscriptionsQueryOptions(group));
  }

  function prefetchVideos() {
    void queryClient.prefetchInfiniteQuery(subscriptionFeedQueryOptions(group));
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
