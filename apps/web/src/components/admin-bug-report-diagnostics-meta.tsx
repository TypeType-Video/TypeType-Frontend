import { formatTimestamp } from "../lib/bug-report-utils";
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
      <p>Route: {report.context.route || "unknown"}</p>
      <p>Language: {report.context.browserLanguage || "unknown"}</p>
      <p title={report.context.userAgent || ""}>
        User agent: {shorten(report.context.userAgent || "unknown", 110)}
      </p>
      {report.context.viewportWidth && report.context.viewportHeight && (
        <p>
          Viewport: {report.context.viewportWidth} x {report.context.viewportHeight}
          {report.context.devicePixelRatio ? ` @ ${report.context.devicePixelRatio}x` : ""}
        </p>
      )}
      <p>
        Network: {report.context.online === false ? "offline" : "online"}
        {report.context.timezone ? ` · ${report.context.timezone}` : ""}
      </p>
      <p>
        Crash logs: {report.context.crashLogs.length} · API errors:{" "}
        {report.context.apiErrors.length}
      </p>
      <p>Captured at: {formatTimestamp(report.context.timestamp)}</p>
    </div>
  );
}
