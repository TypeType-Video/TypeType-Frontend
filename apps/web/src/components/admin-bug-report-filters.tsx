import { categoryOptions, statusOptions } from "../lib/bug-report-utils";
import { m } from "../paraglide/messages.js";
import type { BugReportCategory, BugReportStatus } from "../types/bug-report";

type Props = {
  statusFilter: BugReportStatus | undefined;
  categoryFilter: BugReportCategory | undefined;
  searchText: string;
  onStatusChange: (value: BugReportStatus | undefined) => void;
  onCategoryChange: (value: BugReportCategory | undefined) => void;
  onSearchChange: (value: string) => void;
};

export function AdminBugReportFilters({
  statusFilter,
  categoryFilter,
  searchText,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <input
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={m.ui_search_id_email_text()}
        className="rounded border border-border-strong bg-transparent px-2 py-1.5 text-sm text-fg placeholder:text-fg-soft"
      />
      <select
        value={statusFilter ?? ""}
        onChange={(e) =>
          onStatusChange(e.target.value ? (e.target.value as BugReportStatus) : undefined)
        }
        className="rounded border border-border-strong bg-transparent px-2 py-1.5 text-sm text-fg"
      >
        <option value="" className="bg-fg text-app">
          {m.ui_all_statuses()}
        </option>
        {statusOptions().map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-fg text-app">
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={categoryFilter ?? ""}
        onChange={(e) =>
          onCategoryChange(e.target.value ? (e.target.value as BugReportCategory) : undefined)
        }
        className="rounded border border-border-strong bg-transparent px-2 py-1.5 text-sm text-fg"
      >
        <option value="" className="bg-fg text-app">
          {m.ui_all_categories()}
        </option>
        {categoryOptions().map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-fg text-app">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
