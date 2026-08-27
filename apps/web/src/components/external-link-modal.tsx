import { useEffect } from "react";
import { createPortal } from "react-dom";
import { m } from "../paraglide/messages.js";

type Props = {
  url: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ExternalLinkModal({ url, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancel]);

  return createPortal(
    <>
      <div
        role="none"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-link-title"
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-surface border border-border-strong rounded-xl shadow-2xl p-5 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <p id="external-link-title" className="text-sm font-semibold text-fg">
            {m.ui_you_are_leaving_typetype()}
          </p>
          <p className="text-xs text-fg-muted">{m.ui_this_link_will_open_in_a_new_tab()}</p>
          <p className="text-xs text-fg-muted break-all font-mono bg-surface-strong rounded-lg px-2.5 py-2 mt-0.5">
            {url}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-sm text-fg-muted hover:text-fg bg-surface-strong hover:bg-surface-soft rounded-lg transition-colors"
          >
            {m.portability_cancel()}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 text-sm text-white bg-accent hover:bg-accent-strong rounded-lg transition-colors"
          >
            {m.ui_continue()}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
