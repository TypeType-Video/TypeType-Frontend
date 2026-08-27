import { Copy, Pencil, Power, RefreshCw, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { m } from "../paraglide/messages.js";
import type { RssFeedItem } from "../types/rss";

type Props = {
  feed: RssFeedItem;
  channelNames: Map<string, string>;
  knownLink?: string;
  pending: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onRegenerate: () => void;
  onDelete: () => void;
};

const SERVICE_NAMES = new Map([
  [0, "YouTube"],
  [5, "BiliBili"],
  [6, "NicoNico"],
]);

export function RssFeedRow({
  feed,
  channelNames,
  knownLink,
  pending,
  onCopy,
  onEdit,
  onToggle,
  onRegenerate,
  onDelete,
}: Props) {
  const scope =
    feed.scope === "channels"
      ? feed.channelUrls.map((url) => channelNames.get(url) ?? url).join(", ")
      : m.ui_all_subscriptions();
  const services = feed.serviceIds.map((id) => SERVICE_NAMES.get(id) ?? String(id)).join(", ");
  const types = [
    feed.includeVideos && m.ui_videos(),
    feed.includeShorts && m.nav_shorts(),
    feed.includeLive && m.ui_live(),
    feed.includeUpcoming && m.ui_upcoming(),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center ${feed.enabled ? "" : "opacity-60"}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-fg">{feed.name}</h3>
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${feed.enabled ? "bg-emerald-500" : "bg-fg-soft"}`}
            title={feed.enabled ? m.ui_enabled() : m.ui_disabled()}
          />
        </div>
        <p className="mt-1 truncate text-xs text-fg-muted">{scope}</p>
        <p className="mt-0.5 truncate text-[11px] text-fg-soft">
          {services} · {types}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
        {knownLink && (
          <IconButton label={m.ui_copy_private_link()} onClick={onCopy}>
            <Copy size={14} />
          </IconButton>
        )}
        <IconButton label={m.ui_edit_feed()} onClick={onEdit}>
          <Pencil size={14} />
        </IconButton>
        <IconButton
          label={feed.enabled ? m.ui_disable_feed() : m.ui_enable_feed()}
          onClick={onToggle}
          disabled={pending}
        >
          <Power size={14} />
        </IconButton>
        <IconButton label={m.ui_replace_private_link()} onClick={onRegenerate} disabled={pending}>
          <RefreshCw size={14} />
        </IconButton>
        <IconButton label={m.ui_delete_feed()} onClick={onDelete} disabled={pending} danger>
          <Trash2 size={14} />
        </IconButton>
      </div>
    </article>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40 ${danger ? "text-fg-soft hover:bg-danger/10 hover:text-danger" : "text-fg-soft hover:bg-surface-strong hover:text-fg"}`}
    >
      {children}
    </button>
  );
}
