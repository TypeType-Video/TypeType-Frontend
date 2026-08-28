import { ExternalLink } from "lucide-react";
import { FORMAT_NAMES } from "../lib/portability-catalog";
import { portabilityImportGuide } from "../lib/portability-import-guides";
import { m } from "../paraglide/messages.js";
import { getLocale, type Locale } from "../paraglide/runtime.js";

export function PortabilityImportGuide({
  format,
  locale = getLocale(),
}: {
  format: string;
  locale?: Locale;
}) {
  const guide = portabilityImportGuide(format, locale);
  const name = FORMAT_NAMES[format] ?? format;
  return (
    <section className="border border-border bg-surface px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-fg">
            {m.portability_get_backup({}, { locale })} {name}{" "}
            {m.portability_backup_suffix({}, { locale })}
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-fg-muted">{guide.description}</p>
        </div>
        {guide.action && (
          <a
            href={guide.action.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 border border-border-strong px-3 text-xs font-medium text-fg hover:bg-surface-strong"
          >
            {guide.action.label}
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        )}
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {guide.steps.map((step, index) => (
          <li key={step} className="flex gap-2.5 text-xs text-fg-muted">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-border-strong text-[11px] font-medium text-fg">
              {index + 1}
            </span>
            <span className="pt-0.5 leading-5">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
