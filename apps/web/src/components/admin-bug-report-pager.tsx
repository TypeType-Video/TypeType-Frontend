import { m } from "../paraglide/messages.js";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export function AdminBugReportPager({ page, totalPages, total, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between text-xs text-fg-soft">
      <span>
        {total === 1 ? m.ui_report_count({ count: total }) : m.ui_reports_count({ count: total })}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrev}
          className="rounded border border-border-strong px-2 py-1 disabled:opacity-50"
        >
          {m.ui_prev()}
        </button>
        <span>
          {m.admin_users_page()} {page} {m.admin_users_of()} {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={onNext}
          className="rounded border border-border-strong px-2 py-1 disabled:opacity-50"
        >
          {m.ui_next()}
        </button>
      </div>
    </div>
  );
}
