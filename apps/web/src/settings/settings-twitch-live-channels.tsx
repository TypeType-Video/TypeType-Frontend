import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ChannelAvatar } from "../components/channel-avatar";
import {
  useTwitchFollowedChannelList,
  useTwitchLiveNotifications,
} from "../hooks/use-twitch-live-notifications";
import { proxyImage } from "../lib/proxy";
import { m } from "../paraglide/messages.js";
import { ROW, ToggleSwitch } from "./settings-toggle-switch";

export function SettingsTwitchLiveChannels() {
  const { linked, query, updateChannel } = useTwitchLiveNotifications();
  const show = linked && query.data?.enabled === true;
  const follows = useTwitchFollowedChannelList(show);
  const [search, setSearch] = useState("");
  const muted = useMemo(() => new Set(query.data?.mutedChannels ?? []), [query.data]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return follows.items;
    return follows.items.filter(
      (item) =>
        item.login.toLowerCase().includes(term) || item.displayName.toLowerCase().includes(term),
    );
  }, [search, follows.items]);
  if (!show) return null;

  return (
    <div className="flex flex-col gap-3 pt-2">
      <div>
        <p className="text-sm font-medium text-fg">
          {m.settings_notifications_twitch_channels_label()}
        </p>
        <p className="mt-1 text-xs text-fg-soft">
          {m.settings_notifications_twitch_channels_description()}
        </p>
      </div>
      <label className="flex h-9 items-center gap-2 border border-border-strong bg-app px-2.5">
        <Search size={14} className="shrink-0 text-fg-soft" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={m.settings_search_channels()}
          className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none"
        />
      </label>
      <div className="max-h-96 divide-y divide-border overflow-y-auto border-y border-border">
        {filtered.map((channel) => {
          const enabled = !muted.has(channel.login.toLowerCase());
          return (
            <div key={channel.login} className={ROW}>
              <div className="flex min-w-0 items-center gap-3">
                <ChannelAvatar
                  src={proxyImage(channel.avatarUrl)}
                  name={channel.displayName}
                  className="h-8 w-8"
                />
                <span className="truncate text-sm text-fg">{channel.displayName}</span>
              </div>
              <ToggleSwitch
                checked={enabled}
                ariaLabel={channel.displayName}
                onClick={() => updateChannel.mutate({ login: channel.login, enabled: !enabled })}
              />
            </div>
          );
        })}
        {!follows.isLoading && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-fg-soft">
            {m.settings_notifications_twitch_channels_empty()}
          </p>
        )}
      </div>
      {follows.hasNextPage && (
        <button
          type="button"
          className="self-start text-xs text-fg-muted hover:text-fg"
          disabled={follows.isFetchingNextPage}
          onClick={() => void follows.fetchNextPage()}
        >
          {m.ui_load_more()}
        </button>
      )}
    </div>
  );
}
