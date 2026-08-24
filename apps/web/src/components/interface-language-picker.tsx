import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { m } from "../paraglide/messages.js";
import type { Locale } from "../paraglide/runtime.js";

const OPTIONS: Locale[] = ["en", "fr"];

function languageName(locale: Locale): string {
  return locale === "fr" ? m.language_french() : m.language_english();
}

function LanguageFlag({ locale }: { locale: Locale }) {
  if (locale === "fr") {
    return (
      <span
        className="grid h-4 w-6 shrink-0 grid-cols-3 overflow-hidden rounded-[2px] ring-1 ring-black/15"
        aria-hidden="true"
      >
        <span className="bg-[#1b4fa3]" />
        <span className="bg-white" />
        <span className="bg-[#e33a3a]" />
      </span>
    );
  }
  return (
    <span
      className="relative h-4 w-6 shrink-0 overflow-hidden rounded-[2px] bg-white ring-1 ring-black/15"
      aria-hidden="true"
    >
      <span className="absolute left-0 top-[6px] h-1 w-full bg-[#d62828]" />
      <span className="absolute left-[10px] top-0 h-full w-1 bg-[#d62828]" />
    </span>
  );
}

export function InterfaceLanguagePicker() {
  const { locale, setLocale } = useInterfaceLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative ml-4 shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${m.settings_ui_language_label()}: ${languageName(locale)}`}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-36 items-center gap-2 rounded-md border border-border-strong bg-surface-strong px-2.5 text-xs text-fg transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <LanguageFlag locale={locale} />
        <span className="min-w-0 flex-1 truncate text-left">{languageName(locale)}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        role="listbox"
        aria-label={m.settings_ui_language_label()}
        className={`absolute right-0 top-full z-30 mt-1 w-44 origin-top-right rounded-md border border-border-strong bg-surface-strong p-1 shadow-xl transition-[opacity,transform] duration-150 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={locale === option}
            onClick={() => {
              setOpen(false);
              void setLocale(option);
            }}
            className="flex min-h-9 w-full items-center gap-2 rounded px-2 text-left text-xs text-fg-muted transition-colors hover:bg-surface-soft hover:text-fg"
          >
            <LanguageFlag locale={option} />
            <span className="flex-1">{languageName(option)}</span>
            {locale === option && <Check className="size-3.5 text-fg" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
