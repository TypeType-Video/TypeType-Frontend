import type { PortabilityCategory, PortabilityFidelity } from "../lib/api-portability";
import { PORTABILITY_CATEGORIES } from "../lib/portability-catalog";

type Props = {
  available: Set<PortabilityCategory>;
  selected: Set<PortabilityCategory>;
  onToggle: (category: PortabilityCategory) => void;
  counts?: Partial<Record<PortabilityCategory, number>>;
  fidelity?: Partial<Record<PortabilityCategory, PortabilityFidelity>>;
};

export function PortabilityCategorySelector({
  available,
  selected,
  onToggle,
  counts,
  fidelity,
}: Props) {
  return (
    <div className="grid grid-cols-1 border border-border sm:grid-cols-2">
      {PORTABILITY_CATEGORIES.filter((item) => available.has(item.value)).map((item) => (
        <label
          key={item.value}
          className="flex min-h-16 cursor-pointer items-start gap-3 border-b border-border px-3 py-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r"
        >
          <input
            type="checkbox"
            checked={selected.has(item.value)}
            onChange={() => onToggle(item.value)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-fg"
          />
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2 text-sm text-fg">
              {item.label}
              {counts?.[item.value] !== undefined && (
                <span className="font-mono text-xs text-fg-soft">
                  {counts[item.value]?.toLocaleString()}
                </span>
              )}
              {fidelity?.[item.value] === "partial" && (
                <span className="border border-warning/40 px-1.5 py-0.5 text-[10px] uppercase text-warning">
                  Partial
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-xs text-fg-soft">{item.detail}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
