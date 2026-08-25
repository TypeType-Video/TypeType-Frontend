import { useEffect, useState } from "react";
import { copyText } from "../lib/copy-text";
import { m } from "../paraglide/messages.js";

type ResetTokenModalProps = {
  email: string;
  token: string;
  onClose: () => void;
  onCopied: () => void;
};

export function ResetTokenModal({ email, token, onClose, onCopied }: ResetTokenModalProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleCopy = async () => {
    if (await copyText(token)) {
      setCopyState("copied");
      onCopied();
      return;
    }
    setCopyState("manual");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="rounded-xl border border-border-strong bg-surface p-6 shadow-2xl max-w-sm w-full mx-4 [animation:modal-fade-in_0.2s_ease-out]"
        role="document"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-fg">{m.admin_users_reset_title()}</h2>
          <p className="text-sm text-fg-muted mt-1">{email}</p>
        </div>

        <textarea
          readOnly
          value={token}
          aria-label={m.admin_users_reset_label()}
          onFocus={(event) => event.currentTarget.select()}
          className="mb-4 block h-24 w-full resize-none rounded-lg border border-border bg-app p-3 font-mono text-xs text-fg"
        />

        {copyState === "copied" && (
          <div className="mb-3 rounded border border-emerald-800/50 bg-emerald-950/30 p-2 text-xs text-emerald-200">
            {m.admin_users_token_copied()}
          </div>
        )}
        {copyState === "manual" && (
          <div className="mb-3 rounded border border-border-strong bg-surface-strong p-2 text-xs text-fg-muted">
            {m.admin_users_clipboard_unavailable()}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex-1 h-9 rounded-md border border-border-strong bg-surface-strong px-3 text-sm font-medium text-fg hover:border-border-strong hover:bg-surface-soft transition-colors"
          >
            {m.admin_users_copy_token()}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-md border border-border-strong bg-surface px-3 text-sm font-medium text-fg hover:border-border-strong hover:bg-surface-strong transition-colors"
          >
            {m.admin_users_close()}
          </button>
        </div>
      </div>
    </div>
  );
}
