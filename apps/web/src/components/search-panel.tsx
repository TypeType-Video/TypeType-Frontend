import { siBilibili, siNiconico, siYoutube } from "simple-icons";
import type { SearchPanelState } from "../hooks/use-search-panel";
import { useSettings } from "../hooks/use-settings";
import { m } from "../paraglide/messages.js";
import { ConfirmModal } from "./confirm-modal";
import { SearchOverlayList } from "./search-overlay-list";
import { SearchPanelVideos } from "./search-panel-videos";
import { ServiceIcon } from "./service-icon";

const services = [
  { id: 0, label: "YouTube", path: siYoutube.path, color: "#ff4444" },
  { id: 6, label: "NicoNico", path: siNiconico.path, color: "currentColor" },
  { id: 5, label: "BiliBili", path: siBilibili.path, color: "#00a1d6" },
] as const;

export function SearchPanel({ state, onClose }: { state: SearchPanelState; onClose: () => void }) {
  const { settings } = useSettings();
  const loading = state.showHistory ? state.history.query.isLoading : state.suggestions.isFetching;
  const error = state.showHistory ? state.history.query.isError : state.suggestions.isError;
  return (
    <div className="rounded-lg border border-border-strong bg-surface p-3 text-fg shadow-xl motion-safe:animate-[dropdown-fade-in_0.15s_ease-out]">
      <fieldset
        aria-label={m.nav_services()}
        className="mb-4 flex flex-wrap gap-1 border-b border-border pb-3"
      >
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            aria-label={service.label}
            aria-pressed={state.service === service.id}
            onClick={() => state.changeService(service.id)}
            className={`flex min-h-10 items-center gap-2 rounded-md px-3 text-xs transition-colors ${state.service === service.id ? "bg-surface-strong text-fg" : "text-fg-soft hover:bg-surface-soft"}`}
          >
            <ServiceIcon {...service} />
            {service.label}
          </button>
        ))}
      </fieldset>
      <div
        className={`grid min-w-0 gap-4 ${settings.hideHomeRecommendations ? "" : "md:grid-cols-2"}`}
      >
        <section className="min-w-0">
          <SearchOverlayList
            items={state.items}
            showHistory={state.showHistory}
            selectedIndex={state.selectedIndex}
            listRef={state.listRef}
            onScroll={state.scroll}
            onClearAll={() => state.setConfirmClearOpen(true)}
            onSelect={state.selectTerm}
            className="max-h-64 overflow-y-auto overscroll-contain md:max-h-80"
          />
          {loading && (
            <p role="status" className="px-3 py-3 text-xs text-fg-soft">
              {m.ui_loading()}
            </p>
          )}
          {error && (
            <button
              type="button"
              className="rounded px-3 py-3 text-xs text-fg-muted hover:bg-surface-strong"
              onClick={() =>
                void (state.showHistory
                  ? state.history.query.refetch()
                  : state.suggestions.refetch())
              }
            >
              {m.ui_retry()}
            </button>
          )}
          {!loading && !error && state.items.length === 0 && (
            <p className="px-3 py-4 text-xs text-fg-soft">
              {state.showHistory ? m.search_panel_no_history() : m.search_panel_no_suggestions()}
            </p>
          )}
          {state.history.clear.isError && (
            <p role="alert" className="px-3 py-2 text-xs text-danger">
              {m.search_panel_clear_failed()}
            </p>
          )}
        </section>
        <SearchPanelVideos service={state.service} onClose={onClose} />
      </div>
      {state.confirmClearOpen && (
        <ConfirmModal
          title={m.ui_clear_search_history()}
          description={m.ui_this_removes_all_saved_searches_from_your_account()}
          confirmLabel={m.ui_clear_all()}
          onConfirm={() => void state.clearHistory()}
          onCancel={() => state.setConfirmClearOpen(false)}
        />
      )}
    </div>
  );
}
