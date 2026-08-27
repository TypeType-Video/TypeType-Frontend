import { X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { isRssFeedRequestValid } from "../lib/rss-feed-request";
import { m } from "../paraglide/messages.js";
import type { RssFeedItem, RssFeedRequest } from "../types/rss";
import type { SubscriptionItem } from "../types/user";
import { RssFilterFields, RssScopeFields } from "./rss-feed-editor-fields";

type Props = {
  feed: RssFeedItem | null;
  initialChannel: string | null;
  subscriptions: SubscriptionItem[];
  pending: boolean;
  onSubmit: (request: RssFeedRequest) => void;
  onClose: () => void;
};

function initialRequest(feed: RssFeedItem | null, initialChannel: string | null): RssFeedRequest {
  if (feed) {
    return {
      name: feed.name,
      scope: feed.scope,
      channelUrls: feed.channelUrls,
      serviceIds: feed.serviceIds,
      includeVideos: feed.includeVideos,
      includeShorts: feed.includeShorts,
      includeLive: feed.includeLive,
      includeUpcoming: feed.includeUpcoming,
    };
  }
  return {
    name: initialChannel ? m.ui_channel_feed() : m.ui_my_subscriptions(),
    scope: initialChannel ? "channels" : "all",
    channelUrls: initialChannel ? [initialChannel] : [],
    serviceIds: [0, 5, 6],
    includeVideos: true,
    includeShorts: true,
    includeLive: true,
    includeUpcoming: true,
  };
}

export function RssFeedEditorModal({
  feed,
  initialChannel,
  subscriptions,
  pending,
  onSubmit,
  onClose,
}: Props) {
  const [request, setRequest] = useState(() => initialRequest(feed, initialChannel));
  const valid = isRssFeedRequestValid(request);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || pending) return;
    onSubmit({ ...request, name: request.name.trim() });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label={m.admin_users_close()}
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />
      <form
        onSubmit={submit}
        className="relative flex max-h-[min(46rem,calc(100dvh-1.5rem))] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <h2 className="text-sm font-semibold text-fg">
            {feed ? m.ui_edit_rss_feed() : m.ui_new_rss_feed()}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={m.admin_users_close()}
            title={m.admin_users_close()}
            className="rounded p-1.5 text-fg-soft hover:bg-surface-strong hover:text-fg"
          >
            <X size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">{m.ui_name()}</span>
            <input
              value={request.name}
              maxLength={100}
              onChange={(event) =>
                setRequest((current) => ({ ...current, name: event.target.value }))
              }
              className="h-10 w-full rounded-md border border-border-strong bg-app px-3 text-sm text-fg outline-none focus:border-fg-soft"
            />
          </label>
          <RssScopeFields request={request} setRequest={setRequest} subscriptions={subscriptions} />
          <RssFilterFields request={request} setRequest={setRequest} />
        </div>
        <footer className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md px-3 text-sm text-fg-muted hover:bg-surface-strong hover:text-fg"
          >
            {m.portability_cancel()}
          </button>
          <button
            type="submit"
            disabled={!valid || pending}
            className="h-9 rounded-md bg-fg px-4 text-sm font-medium text-app hover:bg-fg-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? m.ui_saving() : feed ? m.ui_save() : m.ui_create_feed()}
          </button>
        </footer>
      </form>
    </div>,
    document.body,
  );
}
