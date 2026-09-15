import { expect, test } from "bun:test";
import {
  channelMembershipChanges,
  clearMembershipChanges,
  filterGroupChannels,
  selectGroupResults,
  subscriptionFilterParams,
} from "../src/lib/subscription-group-selection";
import type { GroupedSubscription } from "../src/types/subscription-groups";

const channels: GroupedSubscription[] = [
  {
    channelUrl: "https://youtube.com/channel/one",
    name: "One",
    avatarUrl: "",
    subscribedAt: 0,
    groupIds: ["tech", "music"],
  },
  {
    channelUrl: "https://youtube.com/channel/two",
    name: "Two",
    avatarUrl: "",
    subscribedAt: 0,
    groupIds: ["music"],
  },
  {
    channelUrl: "https://youtube.com/channel/three",
    name: "Three",
    avatarUrl: "",
    subscribedAt: 0,
    groupIds: [],
  },
];
const names = (items: GroupedSubscription[]) => items.map((item) => item.name);

test("Not in this group includes channels assigned to other groups", () => {
  expect(names(filterGroupChannels(channels, "tech", true, "", new Set(), false))).toEqual([
    "Two",
    "Three",
  ]);
  expect(names(filterGroupChannels(channels, "ungrouped", false, "", new Set(), false))).toEqual([
    "Three",
  ]);
});

test("search and group filters intersect without altering selection", () => {
  const selected = new Set([channels[0].channelUrl]);
  expect(names(filterGroupChannels(channels, "music", false, " TWO ", selected, false))).toEqual([
    "Two",
  ]);
  expect([...selected]).toEqual([channels[0].channelUrl]);
  const expanded = selectGroupResults(selected, [channels[1].channelUrl, channels[1].channelUrl]);
  expect(expanded.size).toBe(2);
  expect(expanded.has(channels[0].channelUrl)).toBe(true);
});

test("Show selected reveals selections hidden by both search and group", () => {
  expect(
    names(
      filterGroupChannels(
        channels,
        "ungrouped",
        false,
        "no match",
        new Set([channels[0].channelUrl]),
        true,
      ),
    ),
  ).toEqual(["One"]);
});

test("inline save sends only the membership difference", () => {
  expect(channelMembershipChanges(channels[0], new Set(["music", "science"]))).toEqual([
    { groupId: "science", channelUrls: [channels[0].channelUrl], action: "add" },
    { groupId: "tech", channelUrls: [channels[0].channelUrl], action: "remove" },
  ]);
  expect(channelMembershipChanges(channels[0], new Set(channels[0].groupIds))).toEqual([]);
});

test("remove all groups targets only selected channel memberships", () => {
  expect(clearMembershipChanges([channels[1], channels[2]])).toEqual([
    { groupId: "music", channelUrls: [channels[1].channelUrl], action: "remove" },
  ]);
});

test("feed and subscription filters match the server contract", () => {
  expect(subscriptionFilterParams("all").toString()).toBe("");
  expect(subscriptionFilterParams("ungrouped").toString()).toBe("ungrouped=true");
  expect(subscriptionFilterParams("tech").toString()).toBe("groupId=tech");
});
