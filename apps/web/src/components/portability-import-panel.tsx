import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, FileUp, RefreshCw } from "lucide-react";
import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePortabilityJob } from "../hooks/use-portability-job";
import {
  applyPortabilityImport,
  downloadPortabilityReport,
  type PortabilityCategory,
  type PortabilityFormatDescriptor,
  type PortabilityJob,
  startPortabilityImport,
} from "../lib/api-portability";
import { FORMAT_NAMES } from "../lib/portability-catalog";
import { m } from "../paraglide/messages.js";
import { PortabilityCategorySelector } from "./portability-category-selector";
import { PortabilityFormatIcon } from "./portability-format-icon";
import { PortabilityFormatPicker } from "./portability-format-picker";
import { PortabilityImportGuide } from "./portability-import-guide";
import { PortabilityJobStatus } from "./portability-job-status";
import { Toast } from "./toast";

const STORAGE_KEY = "typetype-portability-import-job";

function savedJob(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
}

export function PortabilityImportPanel({ formats }: { formats: PortabilityFormatDescriptor[] }) {
  const input = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const importFormats = useMemo(
    () =>
      formats.filter((format) =>
        format.capabilities.some((item) => item.directions.includes("import")),
      ),
    [formats],
  );
  const [formatName, setFormatName] = useState(
    importFormats.find((format) => format.format === "typetype")?.format ??
      importFormats[0]?.format ??
      "typetype",
  );
  const [jobId, setJobId] = useState<string | null>(savedJob);
  const [selected, setSelected] = useState<Set<PortabilityCategory>>(new Set());
  const [duplicatePolicy, setDuplicatePolicy] = useState<"skip" | "replace">("skip");
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const previousState = useRef<string | null>(null);
  const job = usePortabilityJob(jobId);
  const format = importFormats.find((item) => item.format === formatName) ?? importFormats[0];
  const upload = useMutation({
    mutationFn: (file: File) => startPortabilityImport(file, format.format),
    onSuccess: (started) => {
      setJobId(started.id);
      queryClient.setQueryData(["portability-job", started.id], started);
    },
  });
  const apply = useMutation({
    mutationFn: () => applyPortabilityImport(jobId as string, [...selected], duplicatePolicy),
    onSuccess: (updated) =>
      queryClient.setQueryData<PortabilityJob>(["portability-job", jobId], updated),
  });
  const report = useMutation({ mutationFn: () => downloadPortabilityReport(jobId as string) });

  useEffect(() => {
    if (jobId) window.localStorage.setItem(STORAGE_KEY, jobId);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [jobId]);

  useEffect(() => {
    if (!job.data?.preview || selected.size > 0) return;
    setSelected(new Set(Object.keys(job.data.preview.counts) as PortabilityCategory[]));
  }, [job.data?.preview, selected.size]);

  useEffect(() => {
    const state = job.data?.state ?? null;
    if (state === "completed" && previousState.current !== "completed") {
      const count = Object.values(job.data?.result ?? {}).reduce((sum, value) => sum + value, 0);
      setToast(
        `${m.portability_import_completed()}: ${count.toLocaleString()} ${m.portability_items()}`,
      );
    }
    previousState.current = state;
  }, [job.data?.result, job.data?.state]);

  useEffect(() => {
    if (!job.missing || !jobId) return;
    queryClient.removeQueries({ queryKey: ["portability-job", jobId] });
    setJobId(null);
    setToast(m.portability_stale_job_toast());
  }, [job.missing, jobId, queryClient]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function choose(file: File | undefined) {
    if (file) upload.mutate(file);
  }

  function drop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files[0]);
  }

  function reset() {
    if (jobId) void job.remove.mutateAsync().catch(() => undefined);
    setJobId(null);
    setSelected(new Set());
    upload.reset();
    apply.reset();
  }

  if (!format) return <p className="text-sm text-fg-muted">{m.portability_no_import_format()}</p>;

  const preview = job.data?.preview;
  const failure = upload.error ?? job.error ?? apply.error ?? report.error;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <ArchiveRestore size={20} className="shrink-0 text-fg" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-fg">{m.portability_import_title()}</h2>
          <p className="text-xs text-fg-soft">{m.portability_import_description()}</p>
        </div>
      </div>
      {!jobId && (
        <>
          <PortabilityFormatPicker
            label={m.portability_import_from()}
            formats={importFormats}
            value={format.format}
            onChange={setFormatName}
          />
          <PortabilityImportGuide format={format.format} />
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={drop}
            className={`flex min-h-44 w-full flex-col items-center justify-center border border-dashed px-5 text-center transition-colors ${dragging ? "border-fg bg-surface-strong" : "border-border-strong bg-surface hover:border-fg-soft"}`}
          >
            <FileUp size={24} className="text-fg" />
            <span className="mt-3 text-sm font-medium text-fg">
              {m.portability_choose_or_drop()}
            </span>
            <span className="mt-1 max-w-md text-xs text-fg-soft">
              {m.portability_drop_original_prefix()} .{format.defaultExtension}{" "}
              {m.portability_drop_original_suffix()}
            </span>
          </button>
          <input
            ref={input}
            type="file"
            className="hidden"
            onChange={(event) => {
              choose(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </>
      )}

      {job.data && <PortabilityJobStatus job={job.data} onCancel={() => job.cancel.mutate()} />}

      {preview && job.data?.state === "ready" && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
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
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-8 items-center gap-2 border border-border px-2.5 text-xs text-fg-muted hover:text-fg"
            >
              <RefreshCw size={13} /> {m.portability_different_file()}
            </button>
          </div>
          <PortabilityCategorySelector
            available={new Set(Object.keys(preview.counts) as PortabilityCategory[])}
            selected={selected}
            counts={preview.counts}
            onToggle={(category) =>
              setSelected((current) => {
                const next = new Set(current);
                if (next.has(category)) next.delete(category);
                else next.add(category);
                return next;
              })
            }
          />
          {preview.issues.length > 0 && (
            <div className="border border-warning/40 bg-warning/5 px-3 py-3">
              <p className="text-xs font-medium text-fg">{m.portability_compatibility_notes()}</p>
              <ul className="mt-2 space-y-1 text-xs text-fg-muted">
                {preview.issues.map((issue) => (
                  <li key={`${issue.category}-${issue.code}`}>
                    {issue.message}
                    {issue.count > 1 ? ` (${issue.count})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
            <fieldset>
              <legend className="mb-2 text-xs text-fg-soft">
                {m.portability_duplicate_policy()}
              </legend>
              <div className="inline-flex border border-border bg-surface">
                {(["skip", "replace"] as const).map((policy) => (
                  <button
                    key={policy}
                    type="button"
                    onClick={() => setDuplicatePolicy(policy)}
                    className={`h-8 px-3 text-xs capitalize ${duplicatePolicy === policy ? "bg-fg text-app" : "text-fg-muted hover:text-fg"}`}
                  >
                    {policy === "skip" ? m.portability_skip() : m.portability_replace()}
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              disabled={selected.size === 0 || apply.isPending}
              onClick={() => apply.mutate()}
              className="h-9 bg-fg px-4 text-xs font-medium text-app hover:opacity-90 disabled:opacity-40"
            >
              {m.portability_import_selected()}
            </button>
          </div>
        </section>
      )}

      {job.data && ["completed", "failed", "cancelled"].includes(job.data.state) && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="h-9 border border-border px-3 text-xs text-fg-muted hover:text-fg"
          >
            {m.portability_start_another_import()}
          </button>
          <button
            type="button"
            disabled={report.isPending}
            onClick={() => report.mutate()}
            className="h-9 border border-border px-3 text-xs text-fg-muted hover:text-fg disabled:opacity-40"
          >
            {m.portability_download_report()}
          </button>
        </div>
      )}
      {jobId && !job.data && job.error && (
        <button
          type="button"
          onClick={reset}
          className="h-9 border border-border px-3 text-xs text-fg-muted hover:text-fg"
        >
          {m.portability_choose_another_backup()}
        </button>
      )}
      {failure && (
        <p role="alert" className="text-sm text-danger">
          {failure instanceof Error ? failure.message : m.portability_import_failed()}
        </p>
      )}
      <Toast message={toast} />
    </div>
  );
}
