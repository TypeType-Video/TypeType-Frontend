import { type ReactElement, useId } from "react";
import { YOUTUBE_BUFFER_SECONDS } from "../lib/youtube-buffer";
import { m } from "../paraglide/messages.js";
import { useYoutubeBufferStore } from "../stores/youtube-buffer-store";
import "../styles/youtube-buffer.css";

export function SettingsYoutubeBuffer(): ReactElement {
  const id = useId();
  const seconds = useYoutubeBufferStore((state) => state.seconds);
  const setSeconds = useYoutubeBufferStore((state) => state.setSeconds);
  const lastStop = YOUTUBE_BUFFER_SECONDS.length - 1;
  const progress = (YOUTUBE_BUFFER_SECONDS.indexOf(seconds) / lastStop) * 100;

  return (
    <fieldset className="flex flex-col gap-3 py-4">
      <legend className="typetype-adaptive-label float-left mb-3 flex w-full min-w-0 flex-col gap-1">
        <span id={`${id}-label`} className="text-sm text-fg">
          {m.settings_youtube_buffer_label()}
        </span>
        <span id={`${id}-description`} className="text-xs text-fg-soft">
          {m.settings_youtube_buffer_description()}
        </span>
      </legend>
      <div className="clear-both flex flex-col gap-1">
        <input
          type="range"
          name="youtube-buffer"
          min={0}
          max={lastStop}
          step={1}
          value={YOUTUBE_BUFFER_SECONDS.indexOf(seconds)}
          list={`${id}-steps`}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-description`}
          aria-valuetext={m.settings_youtube_buffer_seconds({ seconds })}
          onChange={(event) => {
            const option = YOUTUBE_BUFFER_SECONDS[Number(event.target.value)];
            if (option !== undefined) setSeconds(option);
          }}
          style={{
            backgroundImage: `linear-gradient(to right, var(--color-zinc-500) ${progress}%, var(--color-zinc-700) ${progress}%)`,
          }}
          className="typetype-youtube-buffer h-8 w-full cursor-pointer accent-fg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <datalist id={`${id}-steps`}>
          {YOUTUBE_BUFFER_SECONDS.map((option, index) => (
            <option
              key={option}
              value={index}
              label={m.settings_youtube_buffer_seconds({ seconds: option })}
            />
          ))}
        </datalist>
        <div className="flex justify-between text-xs tabular-nums" aria-hidden="true">
          {YOUTUBE_BUFFER_SECONDS.map((option) => (
            <span
              key={option}
              className={option === seconds ? "font-medium text-fg" : "text-fg-soft"}
            >
              {m.settings_youtube_buffer_seconds({ seconds: option })}
            </span>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
