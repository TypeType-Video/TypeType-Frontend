import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { m } from "../paraglide/messages.js";

type Props = {
  currentName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

export function PlaylistRenameModal({ currentName, onConfirm, onCancel }: Props) {
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    inputRef.current?.select();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancel]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;
    onConfirm(trimmed);
  }

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
        aria-labelledby="rename-playlist-title"
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-surface border border-border-strong rounded-xl shadow-2xl p-5 flex flex-col gap-4"
      >
        <p id="rename-playlist-title" className="text-sm font-semibold text-fg">
          {m.ui_rename_playlist()}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={m.ui_playlist_name_2()}
            className="bg-surface-strong text-fg placeholder-zinc-500 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-border-strong w-full"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-sm text-fg-muted hover:text-fg bg-surface-strong hover:bg-surface-soft rounded-lg transition-colors"
            >
              {m.portability_cancel()}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name.trim() === currentName}
              className="px-3.5 py-1.5 text-sm text-app bg-fg hover:bg-fg-strong disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {m.watch_save()}
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body,
  );
}
