import { ChevronLeft, ChevronRight } from "lucide-react";
import { m } from "../paraglide/messages.js";

type AdminUsersPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageStart: number;
  pageEnd: number;
  pending: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function AdminUsersPagination({
  page,
  totalPages,
  total,
  pageStart,
  pageEnd,
  pending,
  onPrev,
  onNext,
}: AdminUsersPaginationProps) {
  return (
    <section className="flex min-h-10 items-center justify-between gap-3 px-1 text-xs text-fg-muted">
      <p>
        {pageStart}-{pageEnd} {m.admin_users_of()} {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={pending || page <= 1}
          onClick={onPrev}
          aria-label={m.admin_users_previous_page()}
          title={m.admin_users_previous_page()}
          className="grid size-8 place-items-center rounded-md border border-border text-fg transition-colors hover:bg-surface disabled:opacity-35"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <span className="min-w-20 text-center">
          {m.admin_users_page()} {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={pending || page >= totalPages}
          onClick={onNext}
          aria-label={m.admin_users_next_page()}
          title={m.admin_users_next_page()}
          className="grid size-8 place-items-center rounded-md border border-border text-fg transition-colors hover:bg-surface disabled:opacity-35"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
