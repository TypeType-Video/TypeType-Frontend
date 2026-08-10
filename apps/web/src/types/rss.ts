export type RssScope = "all" | "channels";

export type RssFeedRequest = {
  name: string;
  scope: RssScope;
  channelUrls: string[];
  serviceIds: number[];
  includeVideos: boolean;
  includeShorts: boolean;
  includeLive: boolean;
  includeUpcoming: boolean;
};

export type RssFeedItem = RssFeedRequest & {
  id: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
};

export type RssFeedSecretItem = {
  feed: RssFeedItem;
  feedUrl: string;
};

export type AdminRssFeedItem = {
  feed: RssFeedItem;
  userId: string;
  userName: string;
  userEmail: string;
  userRssEnabled: boolean;
  userSuspended: boolean;
};

export type AdminRssFeedsPage = {
  items: AdminRssFeedItem[];
  page: number;
  limit: number;
  total: number;
};

export type RssInstanceCapability = {
  enabled: boolean;
  maxFeedsPerUser: number;
  maxItems: number;
  minimumPollMinutes: number;
  rateLimitPerMinute: number;
};
