import { AlertTriangle, CheckCircle2, CircleX } from "lucide-react";
import type { PortabilityCategory, PortabilityFidelity } from "../lib/api-portability";
import { portabilityCategories } from "../lib/portability-catalog";
import { m } from "../paraglide/messages.js";
import { getLocale, type Locale } from "../paraglide/runtime.js";

type Props = {
  available: Set<PortabilityCategory>;
  selected: Set<PortabilityCategory>;
  onToggle: (category: PortabilityCategory) => void;
  counts?: Partial<Record<PortabilityCategory, number>>;
  fidelity?: Partial<Record<PortabilityCategory, PortabilityFidelity>>;
  locale?: Locale;
};

export function PortabilityCategorySelector({
  available,
  selected,
  onToggle,
  counts,
  fidelity,
  locale = getLocale(),
}: Props) {
  return (
    <div className="grid grid-cols-1 border border-border sm:grid-cols-2">
      {portabilityCategories(locale).map((item) => {
        const supported = available.has(item.value);
        const partial = fidelity?.[item.value] === "partial";
        const StatusIcon = supported ? (partial ? AlertTriangle : CheckCircle2) : CircleX;
        const statusLabel = supported
          ? partial
            ? m.portability_status_partial({}, { locale })
            : m.portability_status_supported({}, { locale })
          : m.portability_status_not_supported({}, { locale });
        return (
          <label
            key={item.value}
            className={`flex min-h-16 items-start gap-3 border-b border-border px-3 py-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r ${supported ? "cursor-pointer" : "cursor-not-allowed opacity-55"}`}
          >
            <input
              type="checkbox"
              checked={supported && selected.has(item.value)}
              disabled={!supported}
              onChange={() => onToggle(item.value)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-fg"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-start gap-2 text-sm text-fg">
                <span className="min-w-0 flex-1">
                  {item.label}
                  {counts?.[item.value] !== undefined && (
                    <span className="ml-2 font-mono text-xs text-fg-soft">
                      {counts[item.value]?.toLocaleString()}
                    </span>
                  )}
                </span>
                <StatusIcon
                  size={15}
                  className={`mt-0.5 shrink-0 ${partial ? "text-warning" : "text-fg-soft"}`}
                  aria-label={statusLabel}
                />
              </span>
              <span className="mt-0.5 block text-xs text-fg-soft">{item.detail}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
