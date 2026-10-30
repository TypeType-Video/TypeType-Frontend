import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { m } from "../paraglide/messages.js";
import type { Locale } from "../paraglide/runtime.js";
import { LanguageFlag } from "./language-flags/language-flag";

const OPTIONS: Locale[] = ["en", "zh-Hans-CN", "fr", "de"];

function languageName(locale: Locale): string {
  if (locale === "zh-Hans-CN") return m.language_chinese_simplified();
  if (locale === "fr") return m.language_french();
  if (locale === "de") return m.language_german();
  return m.language_english();
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
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${m.settings_ui_language_label()}: ${languageName(locale)}`}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-10 items-center justify-center rounded-sm border border-transparent text-fg transition-colors hover:border-border hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <LanguageFlag locale={locale} />
      </button>
      <div
        role="listbox"
        aria-label={m.settings_ui_language_label()}
        className={`absolute right-0 top-full z-30 mt-1 w-36 origin-top-right rounded-sm border border-border-strong bg-app p-1 shadow-xl transition-[opacity,transform] duration-150 ${
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
            className="flex min-h-9 w-full items-center gap-2 rounded-sm px-2 text-left text-xs text-fg-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <LanguageFlag locale={option} />
            <span data-interface-copy className="flex-1">
              {languageName(option)}
            </span>
            {locale === option && <Check className="size-3.5 text-fg" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
