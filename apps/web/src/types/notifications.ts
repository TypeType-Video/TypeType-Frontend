import type { VideoItem } from "./api";

type SubscriptionNewVideoNotification = {
  type: "subscription_new_video";
  title: string;
  publishedAt?: number | null;
  createdAt: number;
  channelUrl: string;
  channelName: string;
  channelAvatarUrl: string;
  serviceId: number;
  serviceName: string;
  video: VideoItem;
};

export type NotificationItem = SubscriptionNewVideoNotification;

export type NotificationsPage = {
  items: NotificationItem[];
  unreadCount: number;
  nextpage: string | null;
  available: boolean;
};

export type ReadAllNotificationsResponse = {
  readAt: number;
  unreadCount: number;
  available: boolean;
};

export type UnreadNotificationsCount = {
  unreadCount: number;
  available: boolean;
};
