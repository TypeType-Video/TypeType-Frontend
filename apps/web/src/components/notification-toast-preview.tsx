import { BellRing, X } from "lucide-react";

type Props = {
  side: "left" | "right";
  variant: "single" | "grouped";
  animationKey: number;
  onClose: () => void;
};

export function NotificationToastPreview({ side, variant, animationKey, onClose }: Props) {
  const sideClass = side === "left" ? "notification-toast-left" : "notification-toast-right";
  const grouped = variant === "grouped";

  return (
    <aside
      key={`${side}-${variant}-${animationKey}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`notification-toast-preview ${sideClass}`}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={onClose}
          className="flex min-w-0 flex-1 items-center gap-2.5 p-2 text-left hover:bg-surface-strong/70"
        >
          {grouped ? (
            <span className="relative h-11 w-12 shrink-0" aria-hidden="true">
              <span className="absolute right-0 top-0 h-9 w-10 rounded-md border border-border-strong bg-surface-soft" />
              <span className="absolute bottom-0 left-0 flex h-9 w-10 items-center justify-center rounded-md border border-border-strong bg-[#09090b]">
                <img src="/logo.svg" alt="" className="h-5 w-5" />
              </span>
            </span>
          ) : (
            <span className="flex h-11 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-[#09090b]">
              <img src="/logo.svg" alt="" className="h-6 w-6" />
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-accent">
              <BellRing size={11} aria-hidden="true" />
              {grouped ? "3 new uploads" : "New upload"}
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-medium leading-tight text-fg">
              {grouped ? "New videos are waiting" : "A new TypeType preview is ready"}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] text-fg-muted">
              <span className="truncate">{grouped ? "3 channels" : "TypeType"}</span>
              <span className="text-fg-soft">Just now</span>
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mr-1.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-fg-soft hover:bg-surface-strong hover:text-fg"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
