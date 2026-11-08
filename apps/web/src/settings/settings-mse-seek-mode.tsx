import { useState } from "react";
import {
  getMseSeekModePreference,
  type MseSeekModeOption,
  setMseSeekModePreference,
} from "../lib/mse-seek-mode";
import { m } from "../paraglide/messages.js";

const OPTIONS: readonly MseSeekModeOption[] = ["default", "preroll", "native"] as const;

export function SettingsMseSeekMode() {
  const [mode, setMode] = useState<MseSeekModeOption>(getMseSeekModePreference);

  function handleChange(next: MseSeekModeOption) {
    setMode(next);
    setMseSeekModePreference(next);
  }

  const LABELS: Record<MseSeekModeOption, () => string> = {
    default: m.settings_mse_seek_mode_default,
    preroll: m.settings_mse_seek_mode_preroll,
    native: m.settings_mse_seek_mode_native,
  };

  const HINTS: Record<MseSeekModeOption, () => string> = {
    default: m.settings_mse_seek_mode_default_hint,
    preroll: m.settings_mse_seek_mode_preroll_hint,
    native: m.settings_mse_seek_mode_native_hint,
  };

  return (
    <fieldset className="flex flex-col gap-3 py-4">
      <legend className="typetype-adaptive-label float-left mb-3 flex w-full min-w-0 flex-col gap-1">
        <span className="text-sm text-fg">{m.settings_mse_seek_mode_label()}</span>
        <span className="text-xs text-fg-soft">{m.settings_mse_seek_mode_description()}</span>
      </legend>
      <div className="clear-both grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((option) => {
          const selected = option === mode;
          return (
            <label
              key={option}
              className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                selected ? "border-fg bg-fg/5" : "border-border-strong hover:border-fg-soft"
              }`}
            >
              <input
                type="radio"
                name="mse-seek-mode"
                value={option}
                checked={selected}
                onChange={() => handleChange(option)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-fg">{LABELS[option]()}</span>
              <span className="text-xs text-fg-soft">{HINTS[option]()}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
