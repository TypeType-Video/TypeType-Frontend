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
      className={`relative h-6 w-11 shrink-0 rounded-md border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "border-fg bg-fg" : "border-border-strong bg-surface-strong"
      } ${className ?? ""}`}
    >
      <span
        className={`absolute left-[3px] top-1/2 size-[18px] -translate-y-1/2 rounded-full transition-[transform,background-color] duration-200 ease-out ${
          checked ? "translate-x-5 bg-app" : "translate-x-0 bg-fg-muted"
        }`}
      />
    </button>
  );
}
