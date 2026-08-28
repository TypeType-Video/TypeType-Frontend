import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ConfirmModal } from "../components/confirm-modal";
import { HistoryCard } from "../components/history-card";
import type { FilterState } from "../components/history-filter";
import { HistoryFilter } from "../components/history-filter";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { Toast } from "../components/toast";
import { useAuth } from "../hooks/use-auth";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useHistory } from "../hooks/use-history";
import { fetchHistory } from "../lib/api-user";
import { m } from "../paraglide/messages.js";
import type { HistoryItem } from "../types/user";

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function startOfWeek(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const offset = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - offset);
  return d.getTime();
}

function startOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

type DateRange = { from: number; to: number } | null;

function dedupeByUrl(items: HistoryItem[]): HistoryItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function rangeFromFilter(filter: FilterState | null): DateRange {
  if (filter === null) return null;
  const now = new Date();
  if (filter.kind === "preset") {
    if (filter.value === "today") return { from: startOfDay(now), to: Number.MAX_SAFE_INTEGER };
    if (filter.value === "week") return { from: startOfWeek(now), to: Number.MAX_SAFE_INTEGER };
    return { from: startOfMonth(now), to: Number.MAX_SAFE_INTEGER };
  }
  const from = startOfDay(filter.date);
  return { from, to: from + 86_400_000 };
}

function HistoryPage() {
  const { isAuthed } = useAuth();
  const { filter: filterBlocked } = useBlockedFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterState | null>(null);
  const [pendingRemoveItem, setPendingRemoveItem] = useState<HistoryItem | null>(null);
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { query, items, total, remove, clear } = useHistory(searchQuery);
  const dateRange = rangeFromFilter(filter);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const allItemsQuery = useQuery({
    queryKey: ["history-filtered", searchQuery, dateRange?.from ?? null, dateRange?.to ?? null],
    queryFn: () =>
      fetchHistory({
        q: searchQuery || undefined,
        from: dateRange?.from,
        to: dateRange?.to,
        limit: 500,
        offset: 0,
      }),
    enabled: filter !== null && isAuthed,
    staleTime: 30_000,
  });

  const unblocked = useMemo(
    () => filterBlocked(filter !== null ? dedupeByUrl(allItemsQuery.data?.items ?? []) : items),
    [allItemsQuery.data?.items, filter, filterBlocked, items],
  );
  const filteredTotal = filter !== null ? unblocked.length : total;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {unblocked.map((item: HistoryItem) => (
            <HistoryCard key={item.id} item={item} onRemove={() => setPendingRemoveItem(item)} />
          ))}
        </div>
        <ScrollSentinel
          onIntersect={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          enabled={!!query.hasNextPage && !query.isFetchingNextPage && filter === null}
        />
      </div>
      <HistoryFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        resultCount={filteredTotal}
        canClearHistory={total > 0}
        onClearHistory={() => setClearHistoryOpen(true)}
      />
      {clearHistoryOpen && (
        <ConfirmModal
          title={m.ui_clear_watch_history()}
          description={m.ui_this_removes_every_video_from_your_watch_history()}
          confirmLabel={m.ui_clear_all()}
          onConfirm={() => {
            clear.mutate(undefined, {
              onSuccess: () => setToast(m.ui_watch_history_cleared()),
              onError: () => setToast(m.ui_failed_to_clear_history()),
            });
            setClearHistoryOpen(false);
          }}
          onCancel={() => setClearHistoryOpen(false)}
        />
      )}
      {pendingRemoveItem !== null && (
        <ConfirmModal
          title={m.ui_remove_from_history_2()}
          description={m.ui_this_video_will_be_removed_from_your_watch_history()}
          confirmLabel={m.ui_remove()}
          onConfirm={() => {
            remove.mutate({ id: pendingRemoveItem.id, url: pendingRemoveItem.url });
            setPendingRemoveItem(null);
          }}
          onCancel={() => setPendingRemoveItem(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}

export const Route = createFileRoute("/history")({ component: HistoryPage });
