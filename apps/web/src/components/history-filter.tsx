import { useState } from "react";
import { m } from "../paraglide/messages.js";
import { HistoryCalendar } from "./history-calendar";

export type FilterState =
  | { kind: "preset"; value: "today" | "week" | "month" }
  | { kind: "date"; date: Date };

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: FilterState | null;
  onFilterChange: (value: FilterState | null) => void;
  resultCount: number;
  canClearHistory: boolean;
  onClearHistory: () => void;
};

function presetOptions() {
  return [
    { label: m.search_filter_today(), value: "today" as const },
    { label: m.ui_this_week(), value: "week" as const },
    { label: m.ui_this_month(), value: "month" as const },
  ];
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={m.shell_search()}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HistoryFilter({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  resultCount,
  canClearHistory,
  onClearHistory,
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const hasActiveFilter = searchQuery.length > 0 || filter !== null;

  const isPresetActive = (value: string) => filter?.kind === "preset" && filter.value === value;

  const selectedDate = filter?.kind === "date" ? filter.date : null;

  const olderActive = filter?.kind === "date" || calendarOpen;

  const handlePreset = (value: "today" | "week" | "month") => {
    setCalendarOpen(false);
    onFilterChange(isPresetActive(value) ? null : { kind: "preset", value });
  };

  const handleOlderToggle = () => {
    if (calendarOpen) {
      setCalendarOpen(false);
      if (filter?.kind === "date") onFilterChange(null);
    } else {
      setCalendarOpen(true);
      onFilterChange(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    onFilterChange({ kind: "date", date });
  };

  const handleClear = () => {
    onSearchChange("");
    onFilterChange(null);
    setCalendarOpen(false);
  };

  return (
    <aside className="order-first flex w-full flex-shrink-0 flex-col gap-4 rounded-2xl border border-border bg-surface/40 p-3 lg:order-none lg:sticky lg:top-20 lg:w-52 lg:self-start lg:gap-5 lg:border-0 lg:bg-transparent lg:p-0">
      <div>
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <p className="text-[11px] text-fg-soft uppercase tracking-wider">
            {resultCount === 1
              ? m.ui_video_count({ count: resultCount })
              : m.ui_videos_count({ count: resultCount })}
          </p>
          {canClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              className="rounded-md border border-danger/40 px-2.5 py-1 text-[11px] text-danger transition-colors hover:border-danger hover:text-danger-strong"
            >
              {m.ui_clear_all()}
            </button>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-soft pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={m.ui_search_history_2()}
            className="w-full h-9 bg-surface border border-border rounded-lg pl-8 pr-3 text-xs text-fg placeholder-zinc-600 focus:outline-none focus:border-border-strong transition-colors"
          />
        </div>
      </div>

      <div>
        <p className="text-[11px] text-fg-soft uppercase tracking-wider mb-2">{m.ui_date()}</p>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:flex lg:flex-col lg:gap-0.5">
          {presetOptions().map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handlePreset(opt.value)}
              className={`h-8 rounded-lg px-2.5 text-left text-xs transition-colors sm:text-center lg:text-left ${
                isPresetActive(opt.value)
                  ? "bg-fg text-app font-medium"
                  : "text-fg-muted hover:text-fg hover:bg-surface-strong"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <button
            type="button"
            onClick={handleOlderToggle}
            className={`h-8 rounded-lg px-2.5 text-left text-xs transition-colors sm:text-center lg:text-left ${
              olderActive
                ? "bg-fg text-app font-medium"
                : "text-fg-muted hover:text-fg hover:bg-surface-strong"
            }`}
          >
            {selectedDate ? formatDate(selectedDate) : m.ui_older()}
          </button>

          {calendarOpen && <HistoryCalendar selected={selectedDate} onSelect={handleDateSelect} />}
        </div>
      </div>

      {hasActiveFilter && (
        <button
          type="button"
          onClick={handleClear}
          className="text-[11px] text-fg-soft hover:text-fg-muted transition-colors text-left"
        >
          {m.ui_clear_filters()}
        </button>
      )}
    </aside>
  );
}
