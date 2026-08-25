import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, FileUp } from "lucide-react";
import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePersistedPortabilityJob } from "../hooks/use-persisted-portability-job";
import { usePortabilityJob } from "../hooks/use-portability-job";
import {
  applyPortabilityImport,
  downloadPortabilityReport,
  type PortabilityCategory,
  type PortabilityFormatDescriptor,
  type PortabilityJob,
  startPortabilityImport,
} from "../lib/api-portability";
import { m } from "../paraglide/messages.js";
import { PortabilityFormatPicker } from "./portability-format-picker";
import { PortabilityImportGuide } from "./portability-import-guide";
import { PortabilityImportPreview } from "./portability-import-preview";
import { PortabilityJobStatus } from "./portability-job-status";
import { Toast } from "./toast";

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
  const [jobId, setJobId] = usePersistedPortabilityJob("typetype-portability-import-job");
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
  }, [job.missing, jobId, queryClient, setJobId]);

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
        <PortabilityImportPreview
          preview={preview}
          selected={selected}
          duplicatePolicy={duplicatePolicy}
          applying={apply.isPending}
          onReset={reset}
          onToggle={(category) =>
            setSelected((current) => {
              const next = new Set(current);
              if (next.has(category)) next.delete(category);
              else next.add(category);
              return next;
            })
          }
          onDuplicatePolicy={setDuplicatePolicy}
          onApply={() => apply.mutate()}
        />
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
