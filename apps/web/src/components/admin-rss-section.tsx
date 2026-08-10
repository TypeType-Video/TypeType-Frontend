import { useEffect, useState } from "react";
import { useAdminRss } from "../hooks/use-admin-rss";
import { useAdminSettings } from "../hooks/use-admin-settings";
import type { AdminSettings } from "../types/admin";
import type { AdminRssFeedItem } from "../types/rss";
import { AdminRssFeedRow, AdminRssPagination, AdminRssStatus } from "./admin-rss-inventory";
import { AdminRssPolicy } from "./admin-rss-policy";
import { ConfirmModal } from "./confirm-modal";

type Props = {
  enabled: boolean;
  onToast: (message: string) => void;
};

const PAGE_SIZE = 20;

export function AdminRssSection({ enabled, onToast }: Props) {
  const settings = useAdminSettings(enabled);
  const [page, setPage] = useState(1);
  const feeds = useAdminRss(enabled, page, PAGE_SIZE);
  const [draft, setDraft] = useState<AdminSettings | null>(null);
  const [revoke, setRevoke] = useState<AdminRssFeedItem | null>(null);

  useEffect(() => {
    if (settings.query.data) setDraft(settings.query.data);
  }, [settings.query.data]);

  const totalPages = Math.max(1, Math.ceil((feeds.query.data?.total ?? 0) / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function saveSettings() {
    if (!draft) return;
    settings.update.mutate(draft, {
      onSuccess: () => onToast("RSS settings updated"),
      onError: (error) => onToast(errorMessage(error, "Unable to update RSS settings")),
    });
  }

  if (settings.query.isPending || !draft) {
    return <AdminRssStatus>Loading RSS controls...</AdminRssStatus>;
  }
  if (settings.query.isError) {
    return (
      <AdminRssStatus danger>
        {errorMessage(settings.query.error, "Unable to load RSS controls")}
      </AdminRssStatus>
    );
  }

  return (
    <div className="space-y-6">
      <AdminRssPolicy
        value={draft}
        saved={settings.query.data ?? draft}
        pending={settings.update.isPending}
        onChange={setDraft}
        onSave={saveSettings}
      />
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="text-sm font-semibold text-fg">Created feeds</h2>
            <p className="mt-1 text-xs text-fg-soft">
              Secrets are never available from this console.
            </p>
          </div>
          <span className="font-mono text-xs text-fg-soft">
            {feeds.query.data?.total ?? 0} total
          </span>
        </div>
        {feeds.query.isPending ? (
          <AdminRssStatus>Loading private feeds...</AdminRssStatus>
        ) : feeds.query.isError ? (
          <AdminRssStatus danger>
            {errorMessage(feeds.query.error, "Unable to load private feeds")}
          </AdminRssStatus>
        ) : (feeds.query.data?.items.length ?? 0) === 0 ? (
          <AdminRssStatus>No private feeds have been created.</AdminRssStatus>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {feeds.query.data?.items.map((item) => (
              <AdminRssFeedRow
                key={item.feed.id}
                item={item}
                pending={
                  feeds.setFeedEnabled.isPending ||
                  feeds.setUserEnabled.isPending ||
                  feeds.revoke.isPending
                }
                onToggleFeed={() =>
                  feeds.setFeedEnabled.mutate(
                    { id: item.feed.id, value: !item.feed.enabled },
                    {
                      onSuccess: () =>
                        onToast(item.feed.enabled ? "RSS feed disabled" : "RSS feed enabled"),
                      onError: (error) => onToast(errorMessage(error, "Unable to update RSS feed")),
                    },
                  )
                }
                onToggleUser={() =>
                  feeds.setUserEnabled.mutate(
                    { id: item.userId, value: !item.userRssEnabled },
                    {
                      onSuccess: () =>
                        onToast(
                          item.userRssEnabled ? "Account RSS disabled" : "Account RSS enabled",
                        ),
                      onError: (error) =>
                        onToast(errorMessage(error, "Unable to update account RSS")),
                    },
                  )
                }
                onRevoke={() => setRevoke(item)}
              />
            ))}
          </div>
        )}
        <AdminRssPagination
          page={page}
          totalPages={totalPages}
          total={feeds.query.data?.total ?? 0}
          pageSize={PAGE_SIZE}
          pending={feeds.query.isFetching}
          onPage={setPage}
        />
      </section>
      {revoke && (
        <ConfirmModal
          title="Revoke this RSS feed?"
          description={`${revoke.feed.name} will stop working immediately.`}
          confirmLabel="Revoke"
          onCancel={() => setRevoke(null)}
          onConfirm={() => {
            const selected = revoke;
            setRevoke(null);
            feeds.revoke.mutate(selected.feed.id, {
              onSuccess: () => onToast("RSS feed revoked"),
              onError: (error) => onToast(errorMessage(error, "Unable to revoke RSS feed")),
            });
          }}
        />
      )}
    </div>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
