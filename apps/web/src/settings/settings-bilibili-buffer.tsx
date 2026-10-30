import {
  BILIBILI_BUFFER_BASELINE_SECONDS,
  BILIBILI_BUFFER_LEVELS,
  type BilibiliBufferLevel,
} from "../lib/bilibili-buffer";
import { m } from "../paraglide/messages.js";
import { useBilibiliBufferStore } from "../stores/bilibili-buffer-store";

const LABELS: Record<BilibiliBufferLevel, () => string> = {
  saver: m.settings_bilibili_buffer_saver,
  normal: m.settings_bilibili_buffer_normal,
  large: m.settings_bilibili_buffer_large,
};

const HINTS: Record<BilibiliBufferLevel, () => string> = {
  saver: m.settings_bilibili_buffer_saver_hint,
  normal: m.settings_bilibili_buffer_normal_hint,
  large: m.settings_bilibili_buffer_large_hint,
};

export function SettingsBilibiliBuffer() {
  const level = useBilibiliBufferStore((state) => state.level);
  const setLevel = useBilibiliBufferStore((state) => state.setLevel);

  return (
    <fieldset className="flex flex-col gap-3 py-4">
      <legend className="typetype-adaptive-label float-left mb-3 flex w-full min-w-0 flex-col gap-1">
        <span className="text-sm text-fg">{m.settings_bilibili_buffer_label()}</span>
        <span className="text-xs text-fg-soft">{m.settings_bilibili_buffer_description()}</span>
      </legend>
      <div className="clear-both grid gap-2 sm:grid-cols-3">
        {BILIBILI_BUFFER_LEVELS.map((option) => {
          const selected = option === level;
          return (
            <label
              key={option}
              className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                selected ? "border-fg bg-fg/5" : "border-border-strong hover:border-fg-soft"
              }`}
            >
              <input
                type="radio"
                name="bilibili-buffer"
                value={option}
                checked={selected}
                onChange={() => setLevel(option)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-fg">{LABELS[option]()}</span>
              <span className="text-xs tabular-nums text-fg-muted">
                {m.settings_bilibili_buffer_seconds({
                  seconds: BILIBILI_BUFFER_BASELINE_SECONDS[option],
                })}
              </span>
              <span className="text-xs text-fg-soft">{HINTS[option]()}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
