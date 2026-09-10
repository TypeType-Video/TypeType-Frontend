import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useOverlayLock } from "../hooks/use-overlay-lock";
import { useSearchPanel } from "../hooks/use-search-panel";
import { m } from "../paraglide/messages.js";
import { SearchField } from "./search-field";
import { SearchPanel } from "./search-panel";

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const state = useSearchPanel(onClose, true, true);
  const dialogRef = useRef<HTMLDivElement>(null);
  useOverlayLock(true);
  useEffect(() => {
    const previous = document.activeElement;
    const frame = requestAnimationFrame(() => state.inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [state.inputRef]);
  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={m.shell_search()}
      className="fixed inset-0 z-50 flex h-dvh flex-col bg-app pt-[env(safe-area-inset-top)] text-fg"
      onKeyDown={(event) => {
        if (state.confirmClearOpen) return;
        if (event.key === "Escape") onClose();
        if (event.key !== "Tab") return;
        const controls = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), input, a[href]",
          ) ?? [],
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border p-2">
        <button
          type="button"
          onClick={onClose}
          aria-label={m.ui_back()}
          className="flex h-11 w-10 shrink-0 items-center justify-center rounded-md hover:bg-surface-strong"
        >
          <ArrowLeft size={20} />
        </button>
        <SearchField state={state} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <SearchPanel state={state} onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}
