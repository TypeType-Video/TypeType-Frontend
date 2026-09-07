type Props = {
  buttonRef?: React.Ref<HTMLButtonElement>;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  active?: boolean;
  children: React.ReactNode;
};

const BTN =
  "inline-flex min-h-8 min-w-0 max-w-full flex-wrap items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-center text-sm leading-tight transition-colors";
const BTN_IDLE = "text-fg-muted hover:text-fg hover:bg-surface-strong";
const BTN_ON = "text-fg bg-surface-strong";

export function WatchActionButton({
  buttonRef,
  onClick,
  disabled,
  pressed,
  active,
  children,
}: Props) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={`${BTN} ${active ? BTN_ON : BTN_IDLE} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
