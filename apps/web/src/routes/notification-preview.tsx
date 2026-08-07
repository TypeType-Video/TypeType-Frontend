import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Layers3, PanelLeft, PanelRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { NotificationToastPreview } from "../components/notification-toast-preview";
import "../styles/notification-toast-preview.css";

type Side = "left" | "right";
type Variant = "single" | "grouped";

function PreviewButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium transition-colors ${
        active
          ? "bg-surface-soft text-fg-strong"
          : "text-fg-muted hover:bg-surface-strong hover:text-fg"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function NotificationPreviewPage() {
  const [side, setSide] = useState<Side>("right");
  const [variant, setVariant] = useState<Variant>("single");
  const [visible, setVisible] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);

  function show(next?: { side?: Side; variant?: Variant }) {
    if (next?.side) setSide(next.side);
    if (next?.variant) setVariant(next.variant);
    setVisible(true);
    setAnimationKey((value) => value + 1);
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-5xl flex-col gap-8 py-6 sm:py-10">
      <header className="flex flex-col gap-2 border-b border-border pb-5">
        <div className="flex items-center gap-2 text-accent">
          <BellRing size={18} aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider">UI preview</span>
        </div>
        <h1 className="text-xl font-semibold text-fg sm:text-2xl">New upload notification</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">
          Compare the placement and grouped state before connecting the toast to live notifications.
        </p>
      </header>

      <section className="flex flex-col gap-5" aria-label="Notification preview controls">
        <div className="flex flex-wrap items-end gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xs font-medium text-fg-muted">Entrance</legend>
            <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
              <PreviewButton
                active={side === "left"}
                label="Left"
                icon={<PanelLeft size={15} aria-hidden="true" />}
                onClick={() => show({ side: "left" })}
              />
              <PreviewButton
                active={side === "right"}
                label="Right"
                icon={<PanelRight size={15} aria-hidden="true" />}
                onClick={() => show({ side: "right" })}
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-xs font-medium text-fg-muted">Content</legend>
            <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
              <PreviewButton
                active={variant === "single"}
                label="One video"
                icon={<BellRing size={15} aria-hidden="true" />}
                onClick={() => show({ variant: "single" })}
              />
              <PreviewButton
                active={variant === "grouped"}
                label="Grouped"
                icon={<Layers3 size={15} aria-hidden="true" />}
                onClick={() => show({ variant: "grouped" })}
              />
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => show()}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-strong"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Replay
          </button>
        </div>

        <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-fg">Desktop</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
              Below the navbar, aligned to the selected edge.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-fg">Mobile</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
              Full available width with safe-area spacing.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-fg">Reduced motion</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
              Uses a short fade instead of horizontal movement.
            </p>
          </div>
        </div>
      </section>

      {visible && (
        <NotificationToastPreview
          side={side}
          variant={variant}
          animationKey={animationKey}
          onClose={() => setVisible(false)}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/notification-preview")({
  component: NotificationPreviewPage,
});
