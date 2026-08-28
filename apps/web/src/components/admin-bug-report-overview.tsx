import {
  bugReportCategoryLabel,
  bugReportStatusLabel,
  formatTimestamp,
} from "../lib/bug-report-utils";
import { m } from "../paraglide/messages.js";
import type { BugReportDetail } from "../types/bug-report";

type Props = {
  report: BugReportDetail;
};

export function AdminBugReportOverview({ report }: Props) {
  return (
    <section className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-fg-soft">{m.ui_issue()}</p>
        <span className="text-xs text-fg-soft">{formatTimestamp(report.createdAt)}</span>
      </div>
      <p className="text-sm text-fg-muted">{bugReportStatusLabel(report.status)}</p>
      <p className="whitespace-pre-wrap text-sm text-fg">{report.description}</p>
      <p className="text-xs text-fg-soft">
        {bugReportCategoryLabel(report.category)} · {report.userEmail}
      </p>
      {report.context.videoUrl && (
        <p className="truncate text-xs text-fg-soft">{report.context.videoUrl}</p>
      )}
    </section>
  );
}
