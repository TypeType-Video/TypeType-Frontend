import { Plus, Rss } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmModal } from "../components/confirm-modal";
import { Toast } from "../components/toast";
import { useInstance } from "../hooks/use-instance";
import { useRssFeeds } from "../hooks/use-rss-feeds";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { copyText } from "../lib/copy-text";
import type { RssFeedItem, RssFeedRequest, RssFeedSecretItem } from "../types/rss";
import { RssFeedEditorModal } from "./rss-feed-editor-modal";
import { RssFeedRow } from "./rss-feed-row";
import { RssSecretModal } from "./rss-secret-modal";

type Props = {
  initialChannel: string | null;
  openComposer: boolean;
};

type ConfirmAction = { type: "delete" | "regenerate"; feed: RssFeedItem };

export function SettingsRss({ initialChannel, openComposer }: Props) {
  const instance = useInstance();
  const subscriptions = useSubscriptions();
  const rssEnabled = instance.data?.rss.enabled === true;
  const rss = useRssFeeds(rssEnabled);
  const [editing, setEditing] = useState<RssFeedItem | null | undefined>(undefined);
  const [secret, setSecret] = useState<RssFeedSecretItem | null>(null);
  const [knownLinks, setKnownLinks] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const openedFromShortcut = useRef(false);

  useEffect(() => {
    if (!openComposer || !rssEnabled || openedFromShortcut.current) return;
    openedFromShortcut.current = true;
    setEditing(null);
  }, [openComposer, rssEnabled]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const channelNames = useMemo(
    () => new Map((subscriptions.query.data ?? []).map((item) => [item.channelUrl, item.name])),
    [subscriptions.query.data],
  );
  if (!rssEnabled) return null;

  function rememberSecret(result: RssFeedSecretItem) {
    setKnownLinks((current) => ({ ...current, [result.feed.id]: result.feedUrl }));
    setSecret(result);
  }

  function save(request: RssFeedRequest) {
    if (editing) {
      rss.update.mutate(
        { id: editing.id, request },
        {
          onSuccess: () => {
            setEditing(undefined);
            setToast("RSS feed updated");
          },
          onError: showError,
        },
      );
      return;
    }
    rss.create.mutate(request, {
      onSuccess: (result) => {
        setEditing(undefined);
        rememberSecret(result);
      },
      onError: showError,
    });
  }

  function runConfirmedAction() {
    if (!confirm) return;
    const action = confirm;
    setConfirm(null);
    if (action.type === "delete") {
      rss.remove.mutate(action.feed.id, {
        onSuccess: () => {
          setKnownLinks((current) => withoutKey(current, action.feed.id));
          setToast("RSS feed deleted");
        },
        onError: showError,
      });
      return;
    }
    rss.regenerate.mutate(action.feed.id, {
      onSuccess: rememberSecret,
      onError: showError,
    });
  }

  function showError(error: unknown) {
    setToast(error instanceof Error ? error.message : "Unable to update RSS feed");
  }

  const feeds = rss.query.data ?? [];
  const pending = rss.create.isPending || rss.update.isPending;
  const feedLimit = instance.data?.rss.maxFeedsPerUser ?? 0;
  const limitReached = feeds.length >= feedLimit;

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-medium uppercase text-fg-soft">Private feeds</p>
            <p className="mt-1 text-xs text-fg-muted">
              {feeds.length} of {feedLimit} used
            </p>
          </div>
          <button
            type="button"
            title={limitReached ? "Feed limit reached" : "Create RSS feed"}
            disabled={limitReached}
            onClick={() => setEditing(null)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-fg px-3 text-xs font-medium text-app hover:bg-fg-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} />
            New feed
          </button>
        </div>
        {rss.query.isPending ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-5 text-sm text-fg-muted">
            Loading RSS feeds...
          </div>
        ) : rss.query.isError ? (
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-4 text-sm text-danger-strong">
            {rss.query.error instanceof Error
              ? rss.query.error.message
              : "Unable to load RSS feeds"}
          </div>
        ) : feeds.length === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface/50 px-4 text-center">
            <Rss size={20} className="text-fg-soft" />
            <p className="text-sm text-fg-muted">No private feeds</p>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {feeds.map((feed) => (
              <RssFeedRow
                key={feed.id}
                feed={feed}
                channelNames={channelNames}
                knownLink={knownLinks[feed.id]}
                pending={
                  rss.setEnabled.isPending || rss.regenerate.isPending || rss.remove.isPending
                }
                onCopy={async () => {
                  const link = knownLinks[feed.id];
                  if (link && (await copyText(link))) setToast("Private RSS link copied");
                }}
                onEdit={() => setEditing(feed)}
                onToggle={() =>
                  rss.setEnabled.mutate(
                    { id: feed.id, enabled: !feed.enabled },
                    { onError: showError },
                  )
                }
                onRegenerate={() => setConfirm({ type: "regenerate", feed })}
                onDelete={() => setConfirm({ type: "delete", feed })}
              />
            ))}
          </div>
        )}
      </section>
      {editing !== undefined && (
        <RssFeedEditorModal
          feed={editing}
          initialChannel={editing ? null : initialChannel}
          subscriptions={subscriptions.query.data ?? []}
          pending={pending}
          onSubmit={save}
          onClose={() => setEditing(undefined)}
        />
      )}
      {secret && (
        <RssSecretModal
          feedName={secret.feed.name}
          url={secret.feedUrl}
          onClose={() => setSecret(null)}
        />
      )}
      {confirm && (
        <ConfirmModal
          title={confirm.type === "delete" ? "Delete RSS feed?" : "Replace private link?"}
          description={
            confirm.type === "delete"
              ? "The current link will stop working immediately."
              : "The current private link will be revoked immediately."
          }
          confirmLabel={confirm.type === "delete" ? "Delete" : "Replace link"}
          onConfirm={runConfirmedAction}
          onCancel={() => setConfirm(null)}
        />
      )}
      <Toast message={toast} />
    </>
  );
}

function withoutKey(values: Record<string, string>, key: string): Record<string, string> {
  const next = { ...values };
  delete next[key];
  return next;
}
