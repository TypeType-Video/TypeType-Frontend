import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { usePendingYoutubeTakeout } from "../hooks/use-pending-youtube-takeout";
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
import { PortabilityImportDropzone } from "./portability-import-dropzone";
import { PortabilityImportGuide } from "./portability-import-guide";
import { PortabilityImportPreview } from "./portability-import-preview";
import { PortabilityJobStatus } from "./portability-job-status";
import { Toast } from "./toast";

export function PortabilityImportPanel({ formats }: { formats: PortabilityFormatDescriptor[] }) {
  const { me } = useAuth();
  const ownerId = me?.id;
  const [pendingTakeout, setPendingTakeout] = usePendingYoutubeTakeout(ownerId);
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
  const [toast, setToast] = useState<string | null>(null);
  const previousState = useRef<string | null>(null);
  const job = usePortabilityJob(jobId);
  const format = importFormats.find((item) => item.format === formatName) ?? importFormats[0];
  const upload = useMutation({
    mutationFn: ({ file, prepared }: { file: File; prepared: boolean }) =>
      startPortabilityImport(file, format.format, {
        ownerId,
        preparedFile: prepared ? file : undefined,
        onPrepared: setPendingTakeout,
        onAccepted: (started) => {
          setJobId(started.id);
          queryClient.setQueryData(["portability-job", started.id], started);
        },
      }),
    onSuccess: (started) => queryClient.setQueryData(["portability-job", started.id], started),
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

  function choose(file: File | undefined, prepared = false) {
    if (file && !upload.isPending) upload.mutate({ file, prepared });
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
          {format.format === "youtube-takeout" && pendingTakeout && (
            <button
              type="button"
              disabled={upload.isPending}
              onClick={() => choose(pendingTakeout, true)}
              className="h-9 self-start border border-border px-3 text-xs text-fg-muted hover:text-fg disabled:opacity-40"
            >
              {m.portability_resume_prepared_upload()}
            </button>
          )}
          <PortabilityImportDropzone
            busy={upload.isPending}
            extension={format.defaultExtension}
            label={
              upload.isPending ? m.portability_preparing_upload() : m.portability_choose_or_drop()
            }
            hint={
              m.portability_drop_original_prefix() +
              " ." +
              format.defaultExtension +
              " " +
              m.portability_drop_original_suffix()
            }
            onFile={(file) => choose(file)}
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
