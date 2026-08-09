import { Check, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { copyText } from "../lib/copy-text";

type Props = {
  feedName: string;
  url: string;
  onClose: () => void;
};

export function RssSecretModal({ feedName, url, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function copyUrl() {
    if (!(await copyText(url))) return;
    setCopied(true);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-fg">{feedName}</h2>
            <p className="mt-0.5 text-xs text-fg-soft">Private link shown once</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="rounded p-1.5 text-fg-soft hover:bg-surface-strong hover:text-fg"
          >
            <X size={16} />
          </button>
        </header>
        <div className="space-y-3 p-4">
          <textarea
            readOnly
            value={url}
            aria-label="Private RSS link"
            onFocus={(event) => event.currentTarget.select()}
            className="h-28 w-full resize-none rounded-md border border-border bg-app p-3 font-mono text-xs text-fg outline-none focus:border-fg-soft"
          />
          <button
            type="button"
            onClick={() => void copyUrl()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-fg text-sm font-medium text-app hover:bg-fg-strong"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy private link"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
