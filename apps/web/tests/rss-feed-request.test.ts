import { describe, expect, test } from "bun:test";
import { isRssFeedRequestValid } from "../src/lib/rss-feed-request";
import type { RssFeedRequest } from "../src/types/rss";

const base: RssFeedRequest = {
  name: "My subscriptions",
  scope: "all",
  channelUrls: [],
  serviceIds: [0, 5, 6],
  includeVideos: true,
  includeShorts: true,
  includeLive: true,
  includeUpcoming: true,
};

describe("RSS feed request validation", () => {
  test("enforces the selected channel bounds", () => {
    expect(isRssFeedRequestValid({ ...base, scope: "channels", channelUrls: [] })).toBe(false);
    expect(
      isRssFeedRequestValid({
        ...base,
        scope: "channels",
        channelUrls: Array.from({ length: 101 }, (_, i) => `${i}`),
      }),
    ).toBe(false);
  });
});
