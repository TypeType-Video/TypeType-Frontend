import { BellRing, X } from "lucide-react";
import { useClientLocale } from "../hooks/use-client-locale";
import { formatPublishedDate } from "../lib/format";
import { proxyImage } from "../lib/proxy";
import type { NotificationItem } from "../types/notifications";
import "../styles/notification-toast.css";

type Props = {
  items: NotificationItem[];
  onOpen: () => void;
  onClose: () => void;
  onPausedChange: (paused: boolean) => void;
};

function NotificationVisual({ items }: { items: NotificationItem[] }) {
  const thumbnail = items[0]?.video.thumbnailUrl;
  const source = thumbnail ? proxyImage(thumbnail) : "/logo.svg";
  if (items.length === 1) {
    return (
      <img
        src={source}
        alt=""
        className="h-11 w-12 shrink-0 rounded-md border border-border object-cover"
      />
    );
  }
  return (
    <span className="relative h-11 w-12 shrink-0" aria-hidden="true">
      <span className="absolute right-0 top-0 h-9 w-10 rounded-md border border-border-strong bg-surface-soft" />
      <img
        src={source}
        alt=""
        className="absolute bottom-0 left-0 h-9 w-10 rounded-md border border-border-strong object-cover"
      />
    </span>
  );
}

export function NotificationToast({ items, onOpen, onClose, onPausedChange }: Props) {
  const locale = useClientLocale();
  const first = items[0];
  if (!first) return null;
  const grouped = items.length > 1;
  const channelCount = new Set(items.map((item) => item.channelUrl || item.channelName)).size;
  const publishedAt = first.publishedAt ?? first.video.publishedAt ?? first.createdAt;
  const publishedText = formatPublishedDate(publishedAt, undefined, locale) || "Just now";
  const title = grouped ? `${items.length} new videos are waiting` : first.video.title;
  const source = grouped
    ? `${channelCount} ${channelCount === 1 ? "channel" : "channels"}`
    : first.channelName;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="notification-toast"
      onPointerEnter={() => onPausedChange(true)}
      onPointerLeave={() => onPausedChange(false)}
      onFocusCapture={() => onPausedChange(true)}
      onBlurCapture={() => onPausedChange(false)}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-2.5 p-2 text-left hover:bg-surface-strong/70"
        >
          <NotificationVisual items={items} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-accent">
              <BellRing size={11} aria-hidden="true" />
              {grouped ? `${items.length} new uploads` : "New upload"}
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-medium leading-tight text-fg">
              {title}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] text-fg-muted">
              <span className="truncate">{source}</span>
              <span className="shrink-0 text-fg-soft">{grouped ? "Just now" : publishedText}</span>
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mr-1.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-soft hover:bg-surface-strong hover:text-fg"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
