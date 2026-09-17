import type { Fixture } from "./subscription-groups-state";

export function fixtureMembershipPage(state: Fixture, url: URL): Response {
  const group = url.searchParams.get("groupId");
  if (group && !state.groups.some((item) => item.id === group))
    return Response.json(
      { error: "Group not found", code: "subscription_group_not_found" },
      { status: 404 },
    );
  const page = Math.max(0, Number(url.searchParams.get("page")) || 0);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit")) || 20));
  const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();
  const excluded = url.searchParams.get("excluded") === "true";
  const ungrouped = url.searchParams.get("ungrouped") === "true";
  const channels = state.channels
    .filter(
      (channel) =>
        (group
          ? channel.groupIds.includes(group) !== excluded
          : !ungrouped || channel.groupIds.length === 0) &&
        (!search || `${channel.name} ${channel.channelUrl}`.toLowerCase().includes(search)),
    )
    .sort(
      (a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()) ||
        a.channelUrl.localeCompare(b.channelUrl),
    );
  return Response.json({
    items: channels.slice(page * limit, (page + 1) * limit),
    total: channels.length,
    totalSubscriptions: state.channels.length,
    ungroupedCount: state.channels.filter((channel) => !channel.groupIds.length).length,
    page,
    limit,
  });
}

export async function fixtureMembershipLookup(state: Fixture, request: Request): Promise<Response> {
  const body: unknown = await request.json();
  if (
    !body ||
    typeof body !== "object" ||
    !("channelUrls" in body) ||
    !Array.isArray(body.channelUrls) ||
    body.channelUrls.length > 500
  )
    return Response.json({ error: "Invalid channels" }, { status: 400 });
  const selected = new Set(body.channelUrls);
  return Response.json(state.channels.filter((channel) => selected.has(channel.channelUrl)));
}
