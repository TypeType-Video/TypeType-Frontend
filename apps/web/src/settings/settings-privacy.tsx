import { useEffect, useState } from "react";
import { ConfirmModal } from "../components/confirm-modal";
import { Toast } from "../components/toast";
import { useHistory } from "../hooks/use-history";
import { useSearchHistory } from "../hooks/use-search-history";
import { useSettings } from "../hooks/use-settings";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { m } from "../paraglide/messages.js";
import { ToggleSwitch } from "./settings-toggle-switch";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const GROUP = "divide-y divide-border border-y border-border";
const ROW = "flex min-w-0 items-center justify-between gap-4 py-4";

type ActiveModal = "history" | "subscriptions" | "search-history" | null;

export function SettingsPrivacy() {
  const { total: historyTotal, clear: clearHistory } = useHistory();
  const { query: subsQuery, remove: removeSubscription } = useSubscriptions();
  const { total: searchHistoryTotal, clear: clearSearchHistory } = useSearchHistory();
  const { settings, update } = useSettings();
  const subscriptions = subsQuery.data ?? [];
  const [modal, setModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleConfirm() {
    const activeModal = modal;
    setModal(null);
    try {
      if (activeModal === "history") {
        await clearHistory.mutateAsync();
        setToast(m.ui_watch_history_cleared());
      }
      if (activeModal === "subscriptions") {
        for (const sub of subsQuery.data ?? []) {
          removeSubscription.mutate(sub.channelUrl);
        }
        setToast(m.ui_unsubscribed_from_all_channels());
      }
      if (activeModal === "search-history") {
        await clearSearchHistory.mutateAsync();
        setToast(m.ui_search_history_cleared());
      }
    } catch {
      setToast(m.ui_action_failed());
    }
  }

  const historyLabel = m.ui_history_count({ count: historyTotal });
  const subsLabel = m.ui_subscription_count({ count: subscriptions.length });
  const searchLabel = m.ui_search_history_count({ count: searchHistoryTotal });

  const modalTitle =
    modal === "history"
      ? m.ui_clear_history_question({ label: historyLabel })
      : modal === "subscriptions"
        ? m.ui_unsubscribe_from_count_question({ label: subsLabel })
        : m.ui_clear_search_history_question({ label: searchLabel });
  const confirmLabel =
    modal === "subscriptions" ? m.ui_unsubscribe_all() : m.groups_preview_clear();

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>{m.settings_privacy_label()}</p>
      <div className={GROUP}>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">{m.ui_watch_history_tracking()}</span>
            <span className="text-xs text-fg-soft">
              {m.ui_save_watched_videos_and_playback_progress()}
            </span>
          </div>
          <ToggleSwitch
            checked={!settings.disableWatchHistory}
            onClick={() => update.mutate({ disableWatchHistory: !settings.disableWatchHistory })}
          />
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">{m.portability_category_history()}</span>
            <span className="text-xs text-fg-soft">{historyLabel}</span>
          </div>
          <button
            type="button"
            disabled={historyTotal === 0}
            onClick={() => setModal("history")}
            className="text-xs text-danger hover:text-danger-strong disabled:text-fg-soft disabled:cursor-not-allowed transition-colors ml-6 flex-shrink-0"
          >
            {m.groups_preview_clear()}
          </button>
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">{m.portability_category_search_history()}</span>
            <span className="text-xs text-fg-soft">{searchLabel}</span>
          </div>
          <button
            type="button"
            disabled={searchHistoryTotal === 0}
            onClick={() => setModal("search-history")}
            className="text-xs text-danger hover:text-danger-strong disabled:text-fg-soft disabled:cursor-not-allowed transition-colors ml-6 flex-shrink-0"
          >
            {m.groups_preview_clear()}
          </button>
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">{m.portability_category_subscriptions()}</span>
            <span className="text-xs text-fg-soft">{subsLabel}</span>
          </div>
          <button
            type="button"
            disabled={subscriptions.length === 0}
            onClick={() => setModal("subscriptions")}
            className="text-xs text-danger hover:text-danger-strong disabled:text-fg-soft disabled:cursor-not-allowed transition-colors ml-6 flex-shrink-0"
          >
            {m.ui_unsubscribe_all()}
          </button>
        </div>
      </div>
      {modal !== null && (
        <ConfirmModal
          title={modalTitle}
          description={m.ui_this_action_cannot_be_undone()}
          confirmLabel={confirmLabel}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
      <Toast message={toast} />
    </section>
  );
}
