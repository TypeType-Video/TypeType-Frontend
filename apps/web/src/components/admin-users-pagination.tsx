import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <section className="flex min-h-11 items-center justify-between gap-3 border-y border-border px-1 py-1.5 text-xs text-fg-muted">
      <p>
        {pageStart}-{pageEnd} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={pending || page <= 1}
          onClick={onPrev}
          aria-label="Previous page"
          title="Previous page"
          className="grid size-8 place-items-center rounded-full text-fg transition-colors hover:bg-surface-strong disabled:opacity-35"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <span className="min-w-20 text-center">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={pending || page >= totalPages}
          onClick={onNext}
          aria-label="Next page"
          title="Next page"
          className="grid size-8 place-items-center rounded-full text-fg transition-colors hover:bg-surface-strong disabled:opacity-35"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
