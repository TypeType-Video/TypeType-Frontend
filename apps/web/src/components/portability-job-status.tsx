import { AlertTriangle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import type { PortabilityCategory, PortabilityJob } from "../lib/api-portability";
import { categoryLabel } from "../lib/portability-catalog";

type Props = {
  job: PortabilityJob;
  onCancel?: () => void;
  cancelling?: boolean;
};

const ACTIVE = new Set(["queued", "analyzing", "applying", "encoding"]);

function progressPercent(job: PortabilityJob): number | null {
  const progress = job.progress;
  if (!progress?.total || progress.total <= 0) return null;
  return Math.min(100, Math.round((progress.processed / progress.total) * 100));
}

function stateLabel(job: PortabilityJob): string {
  if (job.state === "queued") return "Waiting to start";
  if (job.state === "analyzing") return "Analyzing backup";
  if (job.state === "ready") return "Ready to import";
  if (job.state === "applying") return "Importing data";
  if (job.state === "encoding") return "Generating export";
  if (job.state === "completed") return job.kind === "import" ? "Import completed" : "Export ready";
  if (job.state === "cancelled") return "Operation cancelled";
  return "Operation failed";
}

export function PortabilityJobStatus({ job, onCancel, cancelling }: Props) {
  const percent = progressPercent(job);
  const active = ACTIVE.has(job.state);
  const Icon = active ? LoaderCircle : job.state === "failed" ? AlertTriangle : CheckCircle2;
  return (
    <section aria-live="polite" className="border border-border bg-surface px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Icon
            size={18}
            className={`mt-0.5 shrink-0 ${active ? "animate-spin" : ""} ${job.state === "failed" ? "text-danger" : "text-fg"}`}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg">{stateLabel(job)}</p>
            {job.progress && (
              <p className="mt-1 text-xs text-fg-soft">
                {job.progress.processed.toLocaleString()}
                {job.progress.total ? ` of ${job.progress.total.toLocaleString()}` : ""}{" "}
                {job.progress.unit}
              </p>
            )}
            {job.errorCode && <p className="mt-1 text-xs text-danger">{job.errorCode}</p>}
          </div>
        </div>
        {active && onCancel && (
          <button
            type="button"
            disabled={cancelling}
            onClick={onCancel}
            title="Cancel"
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
                {categoryLabel(category as PortabilityCategory)}
              </dt>
              <dd className="font-mono text-sm text-fg">{count?.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
