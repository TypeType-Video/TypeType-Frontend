import { Check } from "lucide-react";
import { PLAYER_COLORS, type PlayerColor, playerColorValue } from "../lib/player-color";
import { m } from "../paraglide/messages.js";
import { usePlayerColorStore } from "../stores/player-color-store";

const LABELS: Record<PlayerColor, () => string> = {
  default: m.player_color_default,
  white: m.player_color_white,
  red: m.player_color_red,
  pink: m.player_color_pink,
  purple: m.player_color_purple,
  blue: m.player_color_blue,
  green: m.player_color_green,
  orange: m.player_color_orange,
};

const DEFAULT_PREVIEW = "linear-gradient(135deg, #f5f5f5 0 50%, #ff174d 50% 100%)";

export function SettingsPlayerColor() {
  const color = usePlayerColorStore((state) => state.color);
  const setColor = usePlayerColorStore((state) => state.setColor);
  const preview = playerColorValue(color) ?? "#f5f5f5";

  return (
    <div className="flex flex-col gap-3 border-y border-border py-4">
      <div className="typetype-adaptive-label flex min-w-0 flex-col gap-1">
        <span className="text-sm text-fg">{m.settings_player_color_label()}</span>
        <span className="text-xs text-fg-soft">{m.settings_player_color_description()}</span>
      </div>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">{m.settings_player_color_label()}</legend>
        {PLAYER_COLORS.map((option) => {
          const selected = option === color;
          const swatch = playerColorValue(option);
          return (
            <label
              key={option}
              title={LABELS[option]()}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-app transition-transform hover:scale-110 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                selected ? "ring-2 ring-fg" : "ring-1 ring-border-strong"
              }`}
              style={{ background: swatch ?? DEFAULT_PREVIEW }}
            >
              <input
                type="radio"
                name="player-color"
                value={option}
                checked={selected}
                onChange={() => setColor(option)}
                aria-label={LABELS[option]()}
                className="sr-only"
              />
              {selected && <Check className="h-4 w-4 text-black/70" aria-hidden="true" />}
            </label>
          );
        })}
      </fieldset>
      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-fg/15">
          <div
            className="absolute inset-y-0 left-0 w-2/5 rounded-full"
            style={{ background: preview }}
          />
        </div>
        <span className="text-xs tabular-nums text-fg-soft">1:42 / 4:15</span>
      </div>
    </div>
  );
}
