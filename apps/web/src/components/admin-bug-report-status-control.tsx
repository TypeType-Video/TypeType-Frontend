import { statusOptions } from "../lib/bug-report-utils";
import { m } from "../paraglide/messages.js";
import type { BugReportDetail, BugReportStatus } from "../types/bug-report";

type Props = {
  report: BugReportDetail;
  busy: boolean;
  onStatusChange: (status: BugReportStatus) => void;
};

export function AdminBugReportStatusControl({ report, busy, onStatusChange }: Props) {
  return (
    <section className="space-y-1">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-fg-soft">
        {m.admin_users_column_status()}
      </p>
      <select
        value={report.status}
        disabled={busy}
        onChange={(e) => onStatusChange(e.target.value as BugReportStatus)}
        className="w-full rounded border border-border-strong bg-transparent px-2 py-1.5 text-sm text-fg disabled:opacity-50"
      >
        {statusOptions().map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </section>
  );
}
