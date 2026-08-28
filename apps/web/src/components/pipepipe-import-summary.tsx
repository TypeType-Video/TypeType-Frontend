import { Link } from "@tanstack/react-router";
import { useClientLocale } from "../hooks/use-client-locale";
import type { PipePipeRestoreSummary } from "../lib/api-restore";
import { formatRestoreTimeRange } from "../lib/restore-time";
import { m } from "../paraglide/messages.js";
import { ImportMascotLoop } from "./import-mascot-loop";

type Props = {
  summary: PipePipeRestoreSummary;
};

export function PipePipeImportSummary({ summary }: Props) {
  const locale = useClientLocale();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-danger/35 bg-gradient-to-br from-surface via-surface to-danger/45 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
          <ImportMascotLoop
            primarySrc="/import-dudu-cooking.webm"
            secondarySrc="/import-cooking-chef.webm"
            className="h-32 w-full rounded-xl object-cover sm:h-28"
            intervalMs={2600}
          />
          <div>
            <p className="text-base font-medium text-fg">{m.groups_preview_import_complete()}</p>
            <p className="mt-1 text-sm text-fg-muted/80">{m.ui_your_backup_has_been_restored()}</p>
            <Link
              to="/subscriptions"
              className="mt-3 inline-flex h-8 items-center rounded-md bg-danger px-3 text-xs text-white hover:bg-danger-strong"
            >
              {m.groups_preview_view_subscriptions()}
            </Link>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border-strong bg-surface/80 px-4 py-4 text-xs">
        <p>
          <span className="text-fg-muted">{m.ui_history()}</span>{" "}
          <span className="text-fg">{summary.history}</span>
        </p>
        <p>
          <span className="text-fg-muted">{m.ui_subscriptions_2()}</span>{" "}
          <span className="text-fg">{summary.subscriptions}</span>
        </p>
        <p>
          <span className="text-fg-muted">{m.ui_playlists_2()}</span>{" "}
          <span className="text-fg">{summary.playlists}</span>
        </p>
        <p>
          <span className="text-fg-muted">{m.ui_playlist_videos_2()}</span>{" "}
          <span className="text-fg">{summary.playlistVideos}</span>
        </p>
        <p>
          <span className="text-fg-muted">{m.ui_watch_dates()}</span>{" "}
          <span className="text-fg">
            {formatRestoreTimeRange(
              summary.historyMinWatchedAt,
              summary.historyMaxWatchedAt,
              locale,
            ) ?? m.ui_no_watch_date_range()}
          </span>
        </p>
      </div>
    </div>
  );
}
