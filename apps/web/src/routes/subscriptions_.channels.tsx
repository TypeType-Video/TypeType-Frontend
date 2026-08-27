import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionChannelList } from "../components/subscription-channel-list";
import { SubscriptionsHeader } from "../components/subscriptions-header";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { SUBSCRIPTION_FEED_KEY } from "../hooks/use-subscription-feed";
import { SUBSCRIPTIONS_KEY, useSubscriptions } from "../hooks/use-subscriptions";
import { fetchSubscriptionFeed, fetchSubscriptions } from "../lib/api-user";
import { m } from "../paraglide/messages.js";

const SUBSCRIPTION_STALE_MS = 5 * 60 * 1000;

function nextSubscriptionPage(last: Awaited<ReturnType<typeof fetchSubscriptionFeed>>) {
  return last.nextpage ?? undefined;
}

function SubscriptionChannelsPage() {
  const queryClient = useQueryClient();
  const { query } = useSubscriptions();
  const { isChannelIdentityBlocked } = useBlockedFilter();
  const subscriptions = (query.data ?? []).filter(
    (item) => !isChannelIdentityBlocked({ url: item.channelUrl, name: item.name }),
  );

  function prefetchChannels() {
    void queryClient.prefetchQuery({
      queryKey: SUBSCRIPTIONS_KEY,
      queryFn: fetchSubscriptions,
      staleTime: SUBSCRIPTION_STALE_MS,
    });
  }

  function prefetchVideos() {
    void queryClient.prefetchInfiniteQuery({
      queryKey: SUBSCRIPTION_FEED_KEY,
      queryFn: ({ pageParam, signal }) => fetchSubscriptionFeed(pageParam as string | null, signal),
      initialPageParam: null as string | null,
      getNextPageParam: nextSubscriptionPage,
      staleTime: SUBSCRIPTION_STALE_MS,
    });
  }

  if (query.isSuccess && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center pt-32">
        <p className="text-sm text-fg-muted">{m.ui_no_subscriptions_yet_2()}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SubscriptionsHeader
        active="channels"
        count={subscriptions.length}
        onVideosIntent={prefetchVideos}
        onChannelsIntent={prefetchChannels}
      />
      {query.isLoading ? (
        <VideoGridSkeleton idPrefix="subscription-channels" />
      ) : (
        <SubscriptionChannelList subscriptions={subscriptions} />
      )}
    </div>
  );
}

export const Route = createFileRoute("/subscriptions_/channels")({
  component: SubscriptionChannelsPage,
});
