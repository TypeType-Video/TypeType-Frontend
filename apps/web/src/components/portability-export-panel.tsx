import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DatabaseBackup, FileDown, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePortabilityJob } from "../hooks/use-portability-job";
import {
  downloadPortabilityArtifact,
  downloadPortabilityReport,
  type PortabilityCategory,
  type PortabilityFormatDescriptor,
  type PortabilityJob,
  startPortabilityExport,
} from "../lib/api-portability";
import { PortabilityCategorySelector } from "./portability-category-selector";
import { PortabilityFormatPicker } from "./portability-format-picker";
import { PortabilityJobStatus } from "./portability-job-status";
import { Toast } from "./toast";
import { m } from "../paraglide/messages.js";

const STORAGE_KEY = "typetype-portability-export-job";

function savedJob(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
}

export function PortabilityExportPanel({ formats }: { formats: PortabilityFormatDescriptor[] }) {
  const exportFormats = useMemo(
    () =>
      formats.filter((format) =>
        format.capabilities.some((item) => item.directions.includes("export")),
      ),
    [formats],
  );
  const [formatName, setFormatName] = useState(exportFormats[0]?.format ?? "typetype");
  const [jobId, setJobId] = useState<string | null>(savedJob);
  const [selected, setSelected] = useState<Set<PortabilityCategory>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const previousState = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const job = usePortabilityJob(jobId);
  const format = exportFormats.find((item) => item.format === formatName) ?? exportFormats[0];
  const available = useMemo(
    () =>
      new Set(
        format?.capabilities
          .filter((item) => item.directions.includes("export"))
          .map((item) => item.category) ?? [],
      ),
    [format],
  );
  const fidelity = useMemo(
    () =>
      Object.fromEntries(format?.capabilities.map((item) => [item.category, item.fidelity]) ?? []),
    [format],
  );
  const generate = useMutation({
    mutationFn: () => startPortabilityExport(format.format, [...selected]),
    onSuccess: (started) => {
      setJobId(started.id);
      queryClient.setQueryData<PortabilityJob>(["portability-job", started.id], started);
    },
  });
  const download = useMutation({
    mutationFn: () =>
      downloadPortabilityArtifact(jobId as string, `typetype-export.${format.defaultExtension}`),
    onSuccess: () => setToast(m.portability_export_download_started()),
  });
  const report = useMutation({ mutationFn: () => downloadPortabilityReport(jobId as string) });
  useEffect(() => {
    if (jobId) localStorage.setItem(STORAGE_KEY, jobId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [jobId]);
  useEffect(() => {
    setSelected(new Set(available));
  }, [available]);
  useEffect(() => {
    const state = job.data?.state ?? null;
    if (state === "completed" && previousState.current !== "completed") {
      setToast(m.portability_export_ready());
    }
    previousState.current = state;
  }, [job.data?.state]);

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

  function reset() {
    if (jobId) void job.remove.mutateAsync().catch(() => undefined);
    setJobId(null);
    generate.reset();
    download.reset();
  }

  if (!format) return <p className="text-sm text-fg-muted">{m.portability_no_export_format()}</p>;
  const failure = job.error ?? generate.error ?? download.error ?? report.error;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <DatabaseBackup size={20} className="shrink-0 text-fg" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-fg">{m.portability_export_title()}</h2>
          <p className="text-xs text-fg-soft">{m.portability_export_description()}</p>
        </div>
      </div>
      {!jobId && (
        <>
          <PortabilityFormatPicker
            label={m.portability_destination_format()}
            formats={exportFormats}
            value={format.format}
            onChange={setFormatName}
          />
          <PortabilityCategorySelector
            available={available}
            selected={selected}
            fidelity={fidelity}
            onToggle={(category) =>
              setSelected((current) => {
                const next = new Set(current);
                if (next.has(category)) next.delete(category);
                else next.add(category);
                return next;
              })
            }
          />
          {Object.values(fidelity).includes("partial") && (
            <p className="border border-warning/40 bg-warning/5 px-3 py-3 text-xs text-fg-muted">
              {m.portability_export_partial_warning()}
            </p>
          )}
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="button"
              disabled={selected.size === 0 || generate.isPending}
              onClick={() => generate.mutate()}
              className="h-9 bg-fg px-4 text-xs font-medium text-app hover:opacity-90 disabled:opacity-40"
            >
              {m.portability_generate_export()}
            </button>
          </div>
        </>
      )}

      {job.data && <PortabilityJobStatus job={job.data} onCancel={() => job.cancel.mutate()} />}

      {job.data?.state === "completed" && (
        <div className="flex flex-col gap-3">
          {job.data.preview?.issues && job.data.preview.issues.length > 0 && (
            <div className="border border-warning/40 bg-warning/5 px-3 py-3">
              <p className="text-xs font-medium text-fg">{m.portability_export_notes()}</p>
              <ul className="mt-2 space-y-1 text-xs text-fg-muted">
                {job.data.preview.issues.map((issue) => (
                  <li key={`${issue.category}-${issue.code}`}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={download.isPending}
              onClick={() => download.mutate()}
              className="inline-flex h-9 items-center justify-center gap-2 bg-fg px-4 text-xs font-medium text-app hover:opacity-90 disabled:opacity-40"
            >
              <FileDown size={14} /> {m.portability_download_export()}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-9 items-center justify-center gap-2 border border-border px-3 text-xs text-fg-muted hover:text-fg"
            >
              <RefreshCw size={13} /> {m.portability_new_export()}
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
        </div>
      )}
      {job.data && ["failed", "cancelled"].includes(job.data.state) && (
        <button
          type="button"
          onClick={reset}
          className="h-9 border border-border px-3 text-xs text-fg-muted hover:text-fg"
        >
          {m.portability_start_another_export()}
        </button>
      )}
      {jobId && !job.data && job.error && (
        <button
          type="button"
          onClick={reset}
          className="h-9 border border-border px-3 text-xs text-fg-muted hover:text-fg"
        >
          {m.portability_start_another_export()}
        </button>
      )}
      {failure && (
        <p role="alert" className="text-sm text-danger">
          {failure instanceof Error ? failure.message : m.portability_export_failed()}
        </p>
      )}
      <Toast message={toast} />
    </div>
  );
}
