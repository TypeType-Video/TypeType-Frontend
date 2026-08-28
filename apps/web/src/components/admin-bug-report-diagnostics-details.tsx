import { Activity, CircleAlert } from "lucide-react";
import { formatTimestamp } from "../lib/bug-report-utils";
import { m } from "../paraglide/messages.js";
import type { BugReportDetail } from "../types/bug-report";

type Props = { report: BugReportDetail };

type TimelineEntry = {
  key: string;
  timestamp: number;
  source: "client" | "api";
  title: string;
  detail: string | null;
  requestId: string | null;
};

function reportTimeline(report: BugReportDetail): TimelineEntry[] {
  const client = report.context.crashLogs.map((entry, index) => ({
    key: `client-${entry.timestamp}-${index}`,
    timestamp: entry.timestamp,
    source: "client" as const,
    title: entry.message,
    detail: entry.stack,
    requestId: null,
  }));
  const api = report.context.apiErrors.map((entry, index) => ({
    key: `api-${entry.timestamp}-${index}`,
    timestamp: entry.timestamp,
    source: "api" as const,
    title: `${entry.status} ${entry.endpoint}`,
    detail: [entry.code, entry.message].filter(Boolean).join(" · ") || null,
    requestId: entry.requestId,
  }));
  return [...client, ...api].sort((left, right) => right.timestamp - left.timestamp);
}

export function AdminBugReportDiagnosticsDetails({ report }: Props) {
  const timeline = reportTimeline(report);

  return (
    <div className="space-y-3">
      {report.context.playerState && (
        <details className="border-t border-border pt-3">
          <summary className="cursor-pointer text-xs font-medium text-fg">
            {m.ui_player_snapshot()}
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-app p-3 text-[11px] text-fg-muted">
            {JSON.stringify(report.context.playerState, null, 2)}
          </pre>
        </details>
      )}
      {timeline.length > 0 && (
        <details open className="border-t border-border pt-3">
          <summary className="cursor-pointer text-xs font-medium text-fg">
            {m.ui_event_timeline()}
            {timeline.length})
          </summary>
          <div className="mt-3 max-h-[32rem] space-y-1 overflow-y-auto pr-1">
            {timeline.map((entry) => (
              <article
                key={entry.key}
                className="grid grid-cols-[20px_1fr] gap-2 rounded-md px-2 py-2 hover:bg-surface-strong/40"
              >
                {entry.source === "api" ? (
                  <CircleAlert className="mt-0.5 size-4 text-danger-strong" aria-hidden="true" />
                ) : (
                  <Activity className="mt-0.5 size-4 text-fg-soft" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-words text-[11px] text-fg-muted">{entry.title}</p>
                    <time className="shrink-0 text-[10px] text-fg-soft">
                      {formatTimestamp(entry.timestamp)}
                    </time>
                  </div>
                  {entry.detail && (
                    <p className="mt-1 break-words text-[10px] text-fg-soft">{entry.detail}</p>
                  )}
                  {entry.requestId && (
                    <p className="mt-1 font-mono text-[10px] text-fg-soft">
                      {m.ui_requestid()} {entry.requestId}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
