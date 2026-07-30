type Props = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  stateLabel?: string;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onClick?: () => void;
};

export function ShortsActionButton({
  icon: Icon,
  label,
  stateLabel,
  active,
  disabled,
  compact,
  onClick,
}: Props) {
  const sizeClass = compact ? "h-9 w-9" : "h-12 w-12";
  const iconClass = compact ? "h-4 w-4" : "h-6 w-6";
  const rootClass = compact
    ? "flex flex-col items-center gap-0.5 text-white/90 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    : "flex flex-col items-center gap-1 text-fg-soft transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-50";
  const idleClass = compact
    ? "border-white/20 bg-black/55 hover:border-white/40 hover:bg-black/75"
    : "border-border-strong bg-surface hover:bg-surface-strong";
  const activeClass = compact ? "border-white/80 bg-white text-black" : "border-fg bg-fg text-app";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={rootClass}
      aria-label={label}
    >
      <div
        className={`flex ${sizeClass} items-center justify-center rounded-full border transition-colors ${
          active ? activeClass : idleClass
        }`}
      >
        <Icon className={iconClass} />
      </div>
      <span
        className={compact ? "sr-only" : "text-[10px] leading-tight text-fg-muted sm:text-[11px]"}
      >
        {stateLabel ?? label}
      </span>
    </button>
  );
}
