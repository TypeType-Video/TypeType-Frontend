import { afterEach, expect, test } from "bun:test";
import { InfiniteQueryObserver, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { SUBSCRIPTION_FEED_KEY, useSubscriptionFeed } from "../src/hooks/use-subscription-feed";
import { SUBSCRIPTIONS_KEY } from "../src/hooks/use-subscriptions";
import { fetchSubscriptionFeed } from "../src/lib/api-user";
import { useAuthStore } from "../src/stores/auth-store";
import type { SubscriptionFeedPage, VideoItem } from "../src/types/api";

const originalFetch = globalThis.fetch;
const clients: QueryClient[] = [];
afterEach(() => {
  globalThis.fetch = originalFetch;
  useAuthStore.getState().setSignedOut();
  for (const client of clients.splice(0)) client.clear();
});

function readFeed(client: QueryClient): ReturnType<typeof useSubscriptionFeed> {
  let state: ReturnType<typeof useSubscriptionFeed> | undefined;
  function ReadFeed(): null {
    state = useSubscriptionFeed();
    return null;
  }
  renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <ReadFeed />
    </QueryClientProvider>,
  );
  if (!state) throw new Error("Feed hook did not render");
  return state;
}

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clients.push(client);
  client.setQueryData(SUBSCRIPTIONS_KEY, []);
  useAuthStore.getState().setToken("feed-error-test");
  const observer = new InfiniteQueryObserver(client, {
    queryKey: SUBSCRIPTION_FEED_KEY,
    queryFn: ({ pageParam }) => fetchSubscriptionFeed(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last: SubscriptionFeedPage) => last.nextpage ?? undefined,
  });
  return { client, observer };
}

function video(id: string): VideoItem {
  return {
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    title: id,
    thumbnailUrl: "",
    uploaderName: "Test channel",
    uploaderUrl: "",
    uploaderAvatarUrl: "",
    uploaderVerified: false,
    duration: 100,
    viewCount: 1,
    uploadDate: "",
    uploaded: 0,
    streamType: "VIDEO_STREAM",
    isLive: false,
    isPostLive: false,
    isLiveContent: false,
    requiresMembership: false,
    isShortFormContent: false,
    shortDescription: null,
  };
}

test("a failed next page preserves videos and retries the same cursor", async () => {
  const { client, observer } = setup();
  let failNext = true;
  const cursors: Array<string | null> = [];
  globalThis.fetch = async (input) => {
    const cursor = new URL(String(input), "https://fixture.invalid").searchParams.get("cursor");
    cursors.push(cursor);
    if (cursor && failNext) return Response.json({ error: "Unavailable" }, { status: 503 });
    return Response.json({
      videos: [video(cursor ? "second" : "first")],
      nextpage: cursor ? null : "page-2",
    });
  };
  await observer.refetch();
  await observer.fetchNextPage();
  const failed = readFeed(client);
  expect(failed.streams.map((item) => item.title)).toEqual(["first"]);
  expect(failed.isLoadingError).toBe(false);
  expect(failed.isFetchNextPageError).toBe(true);
  expect(failed.hasNextPage).toBe(true);

  failNext = false;
  await failed.fetchNextPage();
  const recovered = readFeed(client);
  expect(recovered.streams.map((item) => item.title)).toEqual(["first", "second"]);
  expect(recovered.isFetchNextPageError).toBe(false);
  expect(recovered.hasNextPage).toBe(false);
  expect(cursors).toEqual([null, "page-2", "page-2"]);
});

test("an initial-load failure exposes recovery without a pagination error", async () => {
  const { client, observer } = setup();
  globalThis.fetch = async () => Response.json({ error: "Unavailable" }, { status: 503 });
  await observer.refetch();
  const failed = readFeed(client);
  expect(failed.isLoadingError).toBe(true);
  expect(failed.isFetchNextPageError).toBe(false);
  expect(failed.streams).toEqual([]);
  globalThis.fetch = async () => Response.json({ videos: [video("first")], nextpage: null });
  await failed.refetch();
  expect(readFeed(client).isLoadingError).toBe(false);
});

test("a failed background refresh retains cached feed content", async () => {
  const { client, observer } = setup();
  globalThis.fetch = async () => Response.json({ videos: [video("first")], nextpage: null });
  await observer.refetch();
  globalThis.fetch = async () => Response.json({ error: "Unavailable" }, { status: 503 });
  await observer.refetch();
  const failed = readFeed(client);
  expect(failed.isLoadingError).toBe(false);
  expect(failed.isFetchNextPageError).toBe(false);
  expect(failed.streams.map((item) => item.title)).toEqual(["first"]);
});
