import { Power, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { AdminRssFeedItem } from "../types/rss";

type FeedRowProps = {
  item: AdminRssFeedItem;
  pending: boolean;
  onToggleFeed: () => void;
  onToggleUser: () => void;
  onRevoke: () => void;
};

export function AdminRssFeedRow({
  item,
  pending,
  onToggleFeed,
  onToggleUser,
  onRevoke,
}: FeedRowProps) {
  const scope =
    item.feed.scope === "channels"
      ? `${item.feed.channelUrls.length} selected ${item.feed.channelUrls.length === 1 ? "channel" : "channels"}`
      : "All subscriptions";
  const status = item.userSuspended
    ? "Account suspended"
    : !item.userRssEnabled
      ? "Account RSS off"
      : item.feed.enabled
        ? "Active"
        : "Feed off";
  const active = status === "Active";

  return (
    <article
      className={`grid gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center ${active ? "" : "opacity-65"}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium text-fg">{item.feed.name}</h3>
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-emerald-500" : "bg-fg-soft"}`}
          />
          <span className="text-[11px] text-fg-soft">{status}</span>
        </div>
        <p className="mt-1 truncate text-xs text-fg-muted">
          {item.userName} · {item.userEmail}
        </p>
      </div>
      <div className="min-w-0 text-xs text-fg-soft">
        <p className="truncate">{scope}</p>
        <p className="mt-1">Last read: {formatLastUsed(item.feed.lastUsedAt)}</p>
      </div>
      <div className="flex items-center justify-end gap-1">
        <ActionButton
          label={item.feed.enabled ? "Disable feed" : "Enable feed"}
          disabled={pending}
          onClick={onToggleFeed}
        >
          <Power size={14} />
        </ActionButton>
        <ActionButton
          label={item.userRssEnabled ? "Disable RSS for account" : "Enable RSS for account"}
          disabled={pending}
          onClick={onToggleUser}
        >
          {item.userRssEnabled ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
        </ActionButton>
        <ActionButton label="Revoke feed" disabled={pending} onClick={onRevoke} danger>
          <Trash2 size={14} />
        </ActionButton>
      </div>
    </article>
  );
}

export function AdminRssPagination({
  page,
  totalPages,
  total,
  pageSize,
  pending,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  pending: boolean;
  onPage: (page: number) => void;
}) {
  if (total <= pageSize) return null;
  return (
    <div className="flex items-center justify-end gap-3 px-1 text-xs text-fg-muted">
      <button
        type="button"
        disabled={pending || page <= 1}
        onClick={() => onPage(page - 1)}
        className="h-8 rounded-md border border-border px-3 disabled:opacity-40"
      >
        Prev
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={pending || page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="h-8 rounded-md border border-border px-3 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export function AdminRssStatus({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-4 py-5 text-sm ${danger ? "border-danger/40 bg-danger/10 text-danger-strong" : "border-border bg-surface text-fg-muted"}`}
    >
      {children}
    </div>
  );
}

function ActionButton({
  label,
  disabled,
  onClick,
  danger,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-40 ${danger ? "text-fg-soft hover:bg-danger/10 hover:text-danger" : "text-fg-soft hover:bg-surface-strong hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

function formatLastUsed(timestamp: number | null): string {
  if (timestamp === null) return "Never";
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
