import type {
  YoutubeTakeoutImportJob,
  YoutubeTakeoutPreview,
  YoutubeTakeoutReport,
} from "../lib/api-youtube-import";
import { m } from "../paraglide/messages.js";
import { importPhaseLabel } from "./youtube-import-helpers";

type Props = {
  job: YoutubeTakeoutImportJob | null;
  preview: YoutubeTakeoutPreview | null;
  report: YoutubeTakeoutReport | null;
};

function statusLabel(status: YoutubeTakeoutImportJob["status"]): string {
  if (status === "pending") return m.portability_job_ready();
  if (status === "running") return m.portability_job_importing();
  if (status === "completed") return m.portability_job_import_completed();
  return m.portability_job_failed();
}

function reportText(report: YoutubeTakeoutReport): string {
  const subs = report.subscriptions?.imported ?? 0;
  const playlists = report.playlists?.imported ?? 0;
  const items = report.playlistItems?.imported ?? 0;
  return m.ui_import_report_summary({ subscriptions: subs, playlists, videos: items });
}

export function YoutubeImportJobSummary({ job, preview, report }: Props) {
  if (!job) return null;

  return (
    <div className="rounded-md border border-border/70 bg-surface/90">
      <div className="px-4 py-4 text-xs text-fg-muted">
        <p>
          <span className="text-fg-soft">{m.ui_import_id()}</span> {job.jobId}
        </p>
        <p>
          <span className="text-fg-soft">{m.ui_status()}</span> {statusLabel(job.status)}
        </p>
        {job.phase && (
          <p>
            <span className="text-fg-soft">{m.ui_phase()}</span> {importPhaseLabel(job.phase)}
          </p>
        )}
        {preview && (
          <p>
            <span className="text-fg-soft">{m.ui_preview()}</span> {preview.counts.subscriptions}{" "}
            {m.ui_subscriptions()} {preview.counts.playlists} {m.ui_playlists()}{" "}
            {preview.counts.playlistItems} {m.ui_playlist_videos()}
          </p>
        )}
        {report && (
          <p>
            <span className="text-fg-soft">{m.ui_imported()}</span> {reportText(report)}
          </p>
        )}
      </div>
    </div>
  );
}
