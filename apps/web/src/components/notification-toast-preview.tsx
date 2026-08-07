import { BellRing, X } from "lucide-react";

type Props = {
  side: "left" | "right";
  variant: "single" | "grouped";
  animationKey: number;
  onClose: () => void;
};

export function NotificationToastPreview({ side, variant, animationKey, onClose }: Props) {
  const sideClass = side === "left" ? "notification-toast-left" : "notification-toast-right";

  return (
    <aside
      key={`${side}-${variant}-${animationKey}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`notification-toast-preview ${sideClass}`}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent">
          <BellRing size={15} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-fg">
            {variant === "single" ? "New upload" : "3 new uploads"}
          </p>
          <p className="text-[11px] text-fg-muted">From your subscriptions</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-surface-strong hover:text-fg"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {variant === "single" ? (
        <button
          type="button"
          onClick={onClose}
          className="grid w-full grid-cols-[7rem_1fr] gap-3 p-3 text-left hover:bg-surface-strong/70 sm:grid-cols-[8rem_1fr]"
        >
          <span className="flex aspect-video w-full items-center justify-center rounded-md border border-border bg-[#09090b]">
            <img src="/logo.svg" alt="" className="h-9 w-9" />
          </span>
          <div className="min-w-0 self-center">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-fg">
              A new TypeType preview is ready
            </p>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-soft text-[10px] font-semibold text-fg">
                T
              </span>
              <span className="truncate text-xs text-fg-muted">TypeType</span>
              <span className="shrink-0 text-xs text-fg-soft">Just now</span>
            </div>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-3 p-3">
          <div className="relative h-[4.5rem] w-28 shrink-0">
            <div className="absolute left-2 top-0 h-14 w-24 rounded-md border border-border-strong bg-surface-soft" />
            <div className="absolute left-1 top-2 h-14 w-24 rounded-md border border-border-strong bg-surface-strong" />
            <div className="absolute left-0 top-4 flex h-14 w-24 items-center justify-center rounded-md border border-border-strong bg-[#09090b]">
              <img src="/logo.svg" alt="" className="h-7 w-7" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug text-fg">
              New videos are waiting for you
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
              TypeType and 2 other channels just published.
            </p>
            <span className="mt-2 inline-block text-xs font-medium text-accent">
              Open notifications
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
