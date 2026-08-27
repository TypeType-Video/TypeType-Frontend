import { Check, Search } from "lucide-react";
import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { ChannelAvatar } from "../components/channel-avatar";
import { m } from "../paraglide/messages.js";
import type { RssFeedRequest, RssScope } from "../types/rss";
import type { SubscriptionItem } from "../types/user";

type SharedProps = {
  request: RssFeedRequest;
  setRequest: Dispatch<SetStateAction<RssFeedRequest>>;
};

const SERVICES = [
  { id: 0, label: "YouTube" },
  { id: 5, label: "BiliBili" },
  { id: 6, label: "NicoNico" },
];

function types() {
  return [
    { key: "includeVideos", label: m.ui_videos() },
    { key: "includeShorts", label: m.nav_shorts() },
    { key: "includeLive", label: m.ui_live() },
    { key: "includeUpcoming", label: m.ui_upcoming() },
  ] as const;
}

export function RssScopeFields({
  request,
  setRequest,
  subscriptions,
}: SharedProps & { subscriptions: SubscriptionItem[] }) {
  const [search, setSearch] = useState("");
  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return subscriptions;
    return subscriptions.filter(
      (item) =>
        item.name.toLowerCase().includes(query) || item.channelUrl.toLowerCase().includes(query),
    );
  }, [search, subscriptions]);

  function setScope(scope: RssScope) {
    setRequest((current) => ({
      ...current,
      scope,
      channelUrls: scope === "channels" ? current.channelUrls : [],
    }));
  }

  function toggleChannel(channelUrl: string) {
    setRequest((current) => ({
      ...current,
      channelUrls: current.channelUrls.includes(channelUrl)
        ? current.channelUrls.filter((url) => url !== channelUrl)
        : current.channelUrls.length < 100
          ? [...current.channelUrls, channelUrl]
          : current.channelUrls,
    }));
  }

  return (
    <>
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-fg-muted">
          {m.portability_category_subscriptions()}
        </legend>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-app p-1">
          {(["all", "channels"] as const).map((scope) => (
            <button
              key={scope}
              type="button"
              aria-pressed={request.scope === scope}
              onClick={() => setScope(scope)}
              className={`h-8 rounded px-1 text-xs font-medium transition-colors ${
                request.scope === scope
                  ? "bg-surface-strong text-fg shadow-sm"
                  : "text-fg-soft hover:text-fg"
              }`}
            >
              {scope === "all" ? m.ui_all() : m.groups_preview_channels()}
            </button>
          ))}
        </div>
      </fieldset>
      {request.scope === "channels" && (
        <fieldset className="space-y-2">
          <legend className="flex w-full items-center justify-between text-xs font-medium text-fg-muted">
            <span>{m.groups_preview_channels()}</span>
            <span className="font-normal text-fg-soft">{request.channelUrls.length} / 100</span>
          </legend>
          <div className="overflow-hidden rounded-md border border-border bg-app">
            <label className="flex h-10 items-center gap-2 border-b border-border px-3">
              <Search size={14} className="text-fg-soft" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={m.ui_search_subscriptions()}
                className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-soft"
              />
            </label>
            <div className="max-h-48 divide-y divide-border overflow-y-auto">
              {filteredSubscriptions.map((item) => {
                const selected = request.channelUrls.includes(item.channelUrl);
                return (
                  <button
                    key={item.channelUrl}
                    type="button"
                    aria-pressed={selected}
                    disabled={!selected && request.channelUrls.length >= 100}
                    onClick={() => toggleChannel(item.channelUrl)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChannelAvatar src={item.avatarUrl} name={item.name} className="h-8 w-8" />
                    <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">
                      {item.name}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "border-fg bg-fg text-app" : "border-border-strong text-transparent"}`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
              {filteredSubscriptions.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-fg-soft">
                  {m.ui_no_matching_subscriptions()}
                </p>
              )}
            </div>
          </div>
        </fieldset>
      )}
    </>
  );
}

export function RssFilterFields({ request, setRequest }: SharedProps) {
  function toggleService(serviceId: number) {
    setRequest((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId].sort(),
    }));
  }

  return (
    <>
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-fg-muted">{m.settings_services_label()}</legend>
        <div className="grid grid-cols-3 gap-2">
          {SERVICES.map((service) => {
            const selected = request.serviceIds.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleService(service.id)}
                className={`h-9 rounded-md border text-xs font-medium transition-colors ${selected ? "border-fg bg-fg text-app" : "border-border-strong bg-app text-fg-muted hover:text-fg"}`}
              >
                {service.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-fg-muted">{m.ui_content()}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {types().map((type) => (
            <label
              key={type.key}
              className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-app px-2.5 text-xs text-fg-muted"
            >
              <input
                type="checkbox"
                checked={request[type.key]}
                onChange={(event) =>
                  setRequest((current) => ({ ...current, [type.key]: event.target.checked }))
                }
                className="accent-fg"
              />
              {type.label}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
