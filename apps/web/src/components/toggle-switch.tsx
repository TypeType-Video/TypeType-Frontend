type Props = {
  checked: boolean;
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
};

export function ToggleSwitch({ checked, onClick, ariaLabel, disabled, className }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full border shadow-inner transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-app disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "border-accent bg-accent" : "border-border-strong bg-surface-strong"
      } ${className ?? ""}`}
    >
      <span
        className={`absolute left-[2px] top-1/2 size-5 -translate-y-1/2 rounded-full shadow-sm transition-[transform,background-color] duration-200 ease-out ${
          checked ? "translate-x-5 bg-on-accent" : "translate-x-0 bg-fg-muted"
        }`}
      />
    </button>
  );
}
