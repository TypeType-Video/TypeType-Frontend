import { RefreshCw } from "lucide-react";
import type { PortabilityCategory, PortabilityPreview } from "../lib/api-portability";
import { FORMAT_NAMES } from "../lib/portability-catalog";
import { m } from "../paraglide/messages.js";
import { PortabilityCategorySelector } from "./portability-category-selector";
import { PortabilityFormatIcon } from "./portability-format-icon";

type DuplicatePolicy = "skip" | "replace";

type Props = {
  preview: PortabilityPreview;
  selected: Set<PortabilityCategory>;
  duplicatePolicy: DuplicatePolicy;
  applying: boolean;
  onReset: () => void;
  onToggle: (category: PortabilityCategory) => void;
  onDuplicatePolicy: (policy: DuplicatePolicy) => void;
  onApply: () => void;
};

export function PortabilityImportPreview({
  preview,
  selected,
  duplicatePolicy,
  applying,
  onReset,
  onToggle,
  onDuplicatePolicy,
  onApply,
}: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <PortabilityFormatIcon format={preview.detection.format} className="h-6 w-6" />
          <div>
            <p className="text-sm font-medium text-fg">
              {FORMAT_NAMES[preview.detection.format] ?? preview.detection.format}
              {preview.detection.formatVersion ? ` ${preview.detection.formatVersion}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-fg-soft">
              {preview.duplicates.toLocaleString()} {m.portability_duplicate_records()}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-8 items-center gap-2 border border-border px-2.5 text-xs text-fg-muted hover:text-fg"
        >
          <RefreshCw size={13} /> {m.portability_different_file()}
        </button>
      </div>
      <PortabilityCategorySelector
        available={new Set(Object.keys(preview.counts) as PortabilityCategory[])}
        selected={selected}
        counts={preview.counts}
        onToggle={onToggle}
      />
      {preview.issues.length > 0 && (
        <div className="border border-warning/40 bg-warning/5 px-3 py-3">
          <p className="text-xs font-medium text-fg">{m.portability_compatibility_notes()}</p>
          <ul className="mt-2 space-y-1 text-xs text-fg-muted">
            {preview.issues.map((issue) => (
              <li key={`${issue.category}-${issue.code}`}>
                {m.portability_issue_detected({ code: issue.code })}
                {issue.count > 1 ? ` (${issue.count})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
        <fieldset>
          <legend className="mb-2 text-xs text-fg-soft">{m.portability_duplicate_policy()}</legend>
          <div className="inline-flex border border-border bg-surface">
            {(["skip", "replace"] as const).map((policy) => (
              <button
                key={policy}
                type="button"
                onClick={() => onDuplicatePolicy(policy)}
                className={`h-8 px-3 text-xs capitalize ${duplicatePolicy === policy ? "bg-fg text-app" : "text-fg-muted hover:text-fg"}`}
              >
                {policy === "skip" ? m.portability_skip() : m.portability_replace()}
              </button>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          disabled={selected.size === 0 || applying}
          onClick={onApply}
          className="h-9 bg-fg px-4 text-xs font-medium text-app hover:opacity-90 disabled:opacity-40"
        >
          {m.portability_import_selected()}
        </button>
      </div>
    </section>
  );
}
