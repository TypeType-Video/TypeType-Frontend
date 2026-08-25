import { AlertTriangle, Check, CheckCircle2, Copy, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import type { PortabilityCategory, PortabilityJob } from "../lib/api-portability";
import { categoryLabel } from "../lib/portability-catalog";
import { m } from "../paraglide/messages.js";
import { getLocale, type Locale } from "../paraglide/runtime.js";

type Props = {
  job: PortabilityJob;
  onCancel?: () => void;
  cancelling?: boolean;
  locale?: Locale;
};

const ACTIVE = new Set(["queued", "analyzing", "applying", "encoding"]);

function progressPercent(job: PortabilityJob): number | null {
  const progress = job.progress;
  if (!progress?.total || progress.total <= 0) return null;
  return Math.min(100, Math.round((progress.processed / progress.total) * 100));
}

function stateLabel(job: PortabilityJob, locale: Locale): string {
  if (job.state === "queued") return m.portability_job_waiting({}, { locale });
  if (job.state === "analyzing") return m.portability_job_analyzing({}, { locale });
  if (job.state === "ready") return m.portability_job_ready({}, { locale });
  if (job.state === "applying") return m.portability_job_importing({}, { locale });
  if (job.state === "encoding") return m.portability_job_generating({}, { locale });
  if (job.state === "completed") {
    return job.kind === "import"
      ? m.portability_job_import_completed({}, { locale })
      : m.portability_job_export_ready({}, { locale });
  }
  if (job.state === "cancelled") return m.portability_job_cancelled({}, { locale });
  return m.portability_job_failed({}, { locale });
}

export function PortabilityJobStatus({ job, onCancel, cancelling, locale = getLocale() }: Props) {
  const [copied, setCopied] = useState(false);
  const percent = progressPercent(job);
  const active = ACTIVE.has(job.state);
  const Icon = active ? LoaderCircle : job.state === "failed" ? AlertTriangle : CheckCircle2;
  const reference = [
    `${m.portability_job_label({}, { locale })}: ${job.id}`,
    job.requestId ? `${m.portability_request_label({}, { locale })}: ${job.requestId}` : null,
    job.errorCode ? `${m.portability_code_label({}, { locale })}: ${job.errorCode}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  return (
    <section aria-live="polite" className="border border-border bg-surface px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Icon
            size={18}
            className={`mt-0.5 shrink-0 ${active ? "animate-spin" : ""} ${job.state === "failed" ? "text-danger" : "text-fg"}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg">{stateLabel(job, locale)}</p>
            {job.progress && (
              <p className="mt-1 text-xs text-fg-soft">
                {job.progress.processed.toLocaleString()}
                {job.progress.total ? ` of ${job.progress.total.toLocaleString()}` : ""}{" "}
                {job.progress.unit}
              </p>
            )}
            {job.state === "failed" && (
              <div className="mt-1.5 text-xs text-danger">
                <p>{job.errorMessage ?? m.portability_operation_failed({}, { locale })}</p>
                <div className="mt-1 flex items-center gap-1.5 text-fg-soft">
                  <code className="truncate">{job.errorCode ?? "portability_failed"}</code>
                  <button
                    type="button"
                    title={m.portability_copy_reference({}, { locale })}
                    aria-label={m.portability_copy_reference({}, { locale })}
                    onClick={() => void copyReference()}
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-fg-muted hover:text-fg"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {active && onCancel && (
          <button
            type="button"
            disabled={cancelling}
            onClick={onCancel}
            title={m.portability_cancel({}, { locale })}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border text-fg-muted hover:text-fg disabled:opacity-40"
          >
            <X size={15} />
          </button>
        )}
      </div>
      {active && (
        <div className="mt-3 h-1.5 overflow-hidden bg-surface-strong">
          <div
            className={`h-full bg-fg transition-[width] duration-300 ${percent === null ? "w-1/3 animate-pulse" : ""}`}
            style={percent === null ? undefined : { width: `${percent}%` }}
          />
        </div>
      )}
      {job.result && Object.keys(job.result).length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 sm:grid-cols-3">
          {Object.entries(job.result).map(([category, count]) => (
            <div key={category}>
              <dt className="truncate text-xs text-fg-soft">
                {categoryLabel(category as PortabilityCategory, locale)}
              </dt>
              <dd className="font-mono text-sm text-fg">{count?.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
