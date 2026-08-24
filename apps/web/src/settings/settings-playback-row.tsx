import { ToggleSwitch } from "../components/toggle-switch";

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onClick: () => void;
};

type NumberRowProps = {
  title: string;
  description: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export const PLAYBACK_ROW = "flex items-center justify-between px-4 py-4";

export function PlaybackToggleRow({ title, description, checked, onClick }: ToggleRowProps) {
  return (
    <div className={PLAYBACK_ROW}>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-fg">{title}</span>
        <span className="text-xs text-fg-soft">{description}</span>
      </div>
      <ToggleSwitch checked={checked} ariaLabel={title} onClick={onClick} className="ml-6" />
    </div>
  );
}

export function PlaybackNumberRow({
  title,
  description,
  value,
  min,
  max,
  onChange,
}: NumberRowProps) {
  return (
    <div className={PLAYBACK_ROW}>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-fg">{title}</span>
        <span className="text-xs text-fg-soft">{description}</span>
      </div>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="ml-6 w-20 flex-shrink-0 rounded-lg border border-border-strong bg-surface-strong px-3 py-1.5 text-right text-fg text-xs outline-none focus:ring-1 focus:ring-border-strong"
      />
    </div>
  );
}
