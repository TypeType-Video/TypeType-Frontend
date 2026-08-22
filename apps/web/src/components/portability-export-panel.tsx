import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePortabilityJob } from "../hooks/use-portability-job";
import {
  downloadPortabilityArtifact,
  type PortabilityCategory,
  type PortabilityFormatDescriptor,
  type PortabilityJob,
  startPortabilityExport,
} from "../lib/api-portability";
import { FORMAT_NAMES } from "../lib/portability-catalog";
import { PortabilityCategorySelector } from "./portability-category-selector";
import { PortabilityFormatIcon } from "./portability-format-icon";
import { PortabilityJobStatus } from "./portability-job-status";
import { Toast } from "./toast";

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
    mutationFn: () => downloadPortabilityArtifact(jobId as string),
    onSuccess: () => setToast("Export download started"),
  });

  useEffect(() => {
    if (jobId) localStorage.setItem(STORAGE_KEY, jobId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [jobId]);

  useEffect(() => {
    setSelected(new Set(available));
  }, [available]);

  useEffect(() => {
    const state = job.data?.state ?? null;
    if (state === "completed" && previousState.current !== "completed") setToast("Export ready");
    previousState.current = state;
  }, [job.data?.state]);

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

  if (!format) return <p className="text-sm text-fg-muted">No export format is available.</p>;
  const failure = job.error ?? generate.error ?? download.error;
  return (
    <div className="flex flex-col gap-5">
      {!jobId && (
        <>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase text-fg-soft">Destination format</span>
            <span className="flex h-11 items-center gap-3 border border-border bg-surface px-3 focus-within:border-fg-soft">
              <PortabilityFormatIcon format={format.format} className="h-6 w-6 shrink-0" />
              <select
                value={format.format}
                onChange={(event) => setFormatName(event.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-fg outline-none"
              >
                {exportFormats.map((item) => (
                  <option key={item.format} value={item.format}>
                    {FORMAT_NAMES[item.format] ?? item.format} (.{item.defaultExtension})
                  </option>
                ))}
              </select>
            </span>
          </label>
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
              This destination cannot represent every TypeType field. The completed report will list
              any data that could not be preserved.
            </p>
          )}
          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="button"
              disabled={selected.size === 0 || generate.isPending}
              onClick={() => generate.mutate()}
              className="h-9 bg-fg px-4 text-xs font-medium text-app hover:opacity-90 disabled:opacity-40"
            >
              Generate export
            </button>
          </div>
        </>
      )}

      {job.data && <PortabilityJobStatus job={job.data} onCancel={() => job.cancel.mutate()} />}

      {job.data?.state === "completed" && (
        <div className="flex flex-col gap-3">
          {job.data.preview?.issues && job.data.preview.issues.length > 0 && (
            <div className="border border-warning/40 bg-warning/5 px-3 py-3">
              <p className="text-xs font-medium text-fg">Export notes</p>
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
              <Download size={14} /> Download export
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-9 items-center justify-center gap-2 border border-border px-3 text-xs text-fg-muted hover:text-fg"
            >
              <RefreshCw size={13} /> New export
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
          Start another export
        </button>
      )}
      {jobId && !job.data && job.error && (
        <button
          type="button"
          onClick={reset}
          className="h-9 border border-border px-3 text-xs text-fg-muted hover:text-fg"
        >
          Start another export
        </button>
      )}
      {failure && (
        <p role="alert" className="text-sm text-danger">
          {failure instanceof Error ? failure.message : "Export failed"}
        </p>
      )}
      <Toast message={toast} />
    </div>
  );
}
