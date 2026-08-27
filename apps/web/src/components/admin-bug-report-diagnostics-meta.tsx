import { formatTimestamp } from "../lib/bug-report-utils";
import { m } from "../paraglide/messages.js";
import type { BugReportDetail } from "../types/bug-report";

type Props = {
  report: BugReportDetail;
};

function shorten(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}

export function AdminBugReportDiagnosticsMeta({ report }: Props) {
  return (
    <div className="space-y-1 text-xs text-fg-soft">
      <p>
        {m.ui_route()} {report.context.route || "unknown"}
      </p>
      <p>
        {m.ui_language()} {report.context.browserLanguage || "unknown"}
      </p>
      <p title={report.context.userAgent || ""}>
        {m.ui_user_agent()} {shorten(report.context.userAgent || "unknown", 110)}
      </p>
      {report.context.viewportWidth && report.context.viewportHeight && (
        <p>
          {m.ui_viewport()} {report.context.viewportWidth} x {report.context.viewportHeight}
          {report.context.devicePixelRatio ? ` @ ${report.context.devicePixelRatio}x` : ""}
        </p>
      )}
      <p>
        {m.ui_network()} {report.context.online === false ? m.ui_offline() : m.ui_online()}
        {report.context.timezone ? ` · ${report.context.timezone}` : ""}
      </p>
      <p>
        {m.ui_crash_logs()} {report.context.crashLogs.length} {m.ui_api_errors()}{" "}
        {report.context.apiErrors.length}
      </p>
      <p>
        {m.ui_captured_at()} {formatTimestamp(report.context.timestamp)}
      </p>
    </div>
  );
}
