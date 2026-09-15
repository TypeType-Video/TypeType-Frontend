import type { GroupedSubscription, MembershipChange } from "../types/subscription-groups";

export function filterGroupChannels(
  channels: GroupedSubscription[],
  filter: string,
  excluded: boolean,
  query: string,
  selected: ReadonlySet<string>,
  onlySelected: boolean,
): GroupedSubscription[] {
  const search = query.trim().toLocaleLowerCase();
  return channels.filter((channel) => {
    if (onlySelected) return selected.has(channel.channelUrl);
    const inScope =
      filter === "all" ||
      (filter === "ungrouped"
        ? channel.groupIds.length === 0
        : channel.groupIds.includes(filter) !== excluded);
    return (
      inScope &&
      (!search || `${channel.name} ${channel.channelUrl}`.toLocaleLowerCase().includes(search))
    );
  });
}

export function selectGroupResults(selected: ReadonlySet<string>, urls: string[]): Set<string> {
  return new Set([...selected, ...urls]);
}

export function channelMembershipChanges(
  channel: GroupedSubscription,
  desired: ReadonlySet<string>,
): MembershipChange[] {
  return [
    ...[...desired]
      .filter((id) => !channel.groupIds.includes(id))
      .map((groupId) => ({
        groupId,
        channelUrls: [channel.channelUrl],
        action: "add" as const,
      })),
    ...channel.groupIds
      .filter((id) => !desired.has(id))
      .map((groupId) => ({
        groupId,
        channelUrls: [channel.channelUrl],
        action: "remove" as const,
      })),
  ];
}

export function clearMembershipChanges(channels: GroupedSubscription[]): MembershipChange[] {
  const urlsByGroup = new Map<string, string[]>();
  for (const channel of channels) {
    for (const groupId of channel.groupIds) {
      const urls = urlsByGroup.get(groupId) ?? [];
      urls.push(channel.channelUrl);
      urlsByGroup.set(groupId, urls);
    }
  }
  return [...urlsByGroup].map(([groupId, channelUrls]) => ({
    groupId,
    channelUrls,
    action: "remove",
  }));
}

export function subscriptionFilterParams(filter = "all"): URLSearchParams {
  const params = new URLSearchParams();
  if (filter === "ungrouped") params.set("ungrouped", "true");
  else if (filter !== "all") params.set("groupId", filter);
  return params;
}
