import { ArrowRight, Search, X } from "lucide-react";
import { useId } from "react";
import type { SearchPanelState } from "../hooks/use-search-panel";
import { m } from "../paraglide/messages.js";

export function SearchField({ state, onFocus }: { state: SearchPanelState; onFocus?: () => void }) {
  const id = useId();
  return (
    <form
      onSubmit={state.submit}
      className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-border-strong bg-surface px-2 focus-within:border-fg-soft"
    >
      <Search size={18} className="ml-1 shrink-0 text-fg-soft" aria-hidden="true" />
      <input
        id={id}
        ref={state.inputRef}
        type="search"
        aria-label={m.shell_search()}
        autoComplete="off"
        value={state.query}
        onChange={(e) => state.changeQuery(e.target.value)}
        onFocus={onFocus}
        onKeyDown={state.keyDown}
        placeholder={m.ui_search_videos_channels()}
        className="h-full min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-soft sm:text-sm [&::-webkit-search-cancel-button]:appearance-none"
      />
      {state.query && (
        <button
          type="button"
          title={m.ui_clear()}
          aria-label={m.ui_clear()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-fg-soft hover:bg-surface-strong"
          onClick={() => {
            state.changeQuery("");
            state.inputRef.current?.focus();
          }}
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        title={m.shell_search()}
        aria-label={m.shell_search()}
        className="flex h-9 w-10 shrink-0 items-center justify-center border-l border-border text-fg hover:bg-surface-strong"
      >
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
