import { useEffect, useRef, useState } from "react";
import { FlagIcon } from "../components/flag-icon";
import { LANGUAGES } from "../lib/languages";
import { m } from "../paraglide/messages.js";

type Props = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export function LanguageDropdown({ value, onChange, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = LANGUAGES.find((language) => language.code === value);
  const label = selected ? selected.label.split(" — ")[0] : m.ui_no_preference();
  const normalizedQuery = query.toLowerCase();
  const filtered =
    query.trim() === ""
      ? LANGUAGES
      : LANGUAGES.filter(
          (language) =>
            language.label.toLowerCase().includes(normalizedQuery) ||
            language.code.toLowerCase().includes(normalizedQuery),
        );

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 0);
    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-0 shrink-0 sm:ml-6">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`typetype-adaptive-control flex min-h-9 max-w-full min-w-0 items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface-strong px-3 py-1.5 text-xs transition-colors ${disabled ? "cursor-not-allowed text-fg-soft" : "text-fg hover:bg-surface-soft"}`}
      >
        {selected?.flag && (
          <FlagIcon code={selected.flag} className="w-4 h-3 rounded-sm flex-shrink-0" />
        )}
        <span className="typetype-adaptive-label min-w-0 flex-1">{label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          role="img"
          aria-label={m.ui_toggle()}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && !disabled && (
        <div className="absolute right-0 top-full mt-1 bg-surface-strong border border-border-strong rounded-lg overflow-hidden z-10 w-56 shadow-lg flex flex-col">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={m.ui_search_language()}
            className="px-3 py-2 text-xs bg-surface-strong text-fg placeholder:text-fg-soft border-b border-border-strong focus:outline-none"
          />
          <div className="overflow-y-auto max-h-52">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`typetype-adaptive-control block w-full px-3 py-2 text-left text-xs transition-colors ${value === "" ? "text-fg bg-surface-soft" : "text-fg-muted hover:bg-surface-soft hover:text-fg"}`}
            >
              {m.ui_no_preference()}
            </button>
            {filtered.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => {
                  onChange(language.code);
                  setOpen(false);
                }}
                className={`typetype-adaptive-control flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${language.code === value ? "text-fg bg-surface-soft" : "text-fg-muted hover:bg-surface-soft hover:text-fg"}`}
              >
                {language.flag && (
                  <FlagIcon code={language.flag} className="w-4 h-3 rounded-sm flex-shrink-0" />
                )}
                <span className="typetype-adaptive-label min-w-0 flex-1">{language.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
