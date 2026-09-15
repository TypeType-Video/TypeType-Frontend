import type { SubscriptionItem } from "./user";

export type SubscriptionGroup = {
  id: string;
  name: string;
  channelCount: number;
  createdAt: number;
  updatedAt: number;
};

export type GroupedSubscription = SubscriptionItem & { groupIds: string[] };
export type MembershipChange = {
  groupId: string;
  channelUrls: string[];
  action: "add" | "remove";
};
