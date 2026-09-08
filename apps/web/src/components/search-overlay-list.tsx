import { ArrowUpLeft, Clock3, Search } from "lucide-react";
import type { RefObject } from "react";
import type { SearchOverlayItem } from "../lib/search-overlay-items";
import { m } from "../paraglide/messages.js";

type Props = {
  items: SearchOverlayItem[];
  showHistory: boolean;
  selectedIndex: number;
  listRef: RefObject<HTMLUListElement | null>;
  onScroll: (e: React.UIEvent<HTMLUListElement>) => void;
  onClearAll?: () => void;
  onSelect: (term: string) => void;
  className?: string;
};

export function SearchOverlayList({
  items,
  showHistory,
  selectedIndex,
  listRef,
  onScroll,
  onClearAll,
  onSelect,
  className,
}: Props) {
  if (items.length === 0) return null;

  const listClass =
    className ??
    "mt-1 max-h-[22rem] overflow-y-auto scroll-smooth bg-surface border border-border-strong rounded-lg";

  return (
    <ul ref={listRef} onScroll={onScroll} className={listClass}>
      <li className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2">
        <span className="text-xs font-medium text-fg-soft">
          {showHistory
            ? m.portability_category_search_history_detail()
            : m.search_panel_suggestions()}
        </span>
        {showHistory && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-fg-soft hover:text-fg-muted transition-colors"
          >
            {m.ui_clear_all()}
          </button>
        )}
      </li>
      {items.map((item, index) => (
        <li key={item.key}>
          <button
            type="button"
            data-item-index={index}
            className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
              index === selectedIndex
                ? "bg-surface-soft text-fg"
                : "text-fg-muted hover:bg-surface-strong"
            }`}
            onClick={() => onSelect(item.label)}
          >
            {item.source === "history" ? (
              <Clock3 size={16} className="shrink-0 text-fg-soft" aria-hidden="true" />
            ) : (
              <Search size={16} className="shrink-0 text-fg-soft" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1 break-words">{item.label}</span>
            <ArrowUpLeft size={14} className="shrink-0 text-fg-soft" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
