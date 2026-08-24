import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "../hooks/use-settings";
import { DEFAULT_PLAYBACK_SPEED_OPTIONS, playbackSpeedLabel } from "../lib/playback-speed";
import { PLAYBACK_ROW, PlaybackNumberRow, PlaybackToggleRow } from "./settings-playback-row";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const GROUP = "divide-y divide-border border-y border-border";

const QUALITY_OPTIONS = [
  { label: "Auto", value: "auto" },
  ...["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p"].map((quality) => ({
    label: quality,
    value: quality,
  })),
];

type DropdownProps = {
  value: string;
  onChange: (q: string) => void;
};

type SpeedDropdownProps = {
  value: number;
  onChange: (speed: number) => void;
};

function QualityDropdown({ value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-6 flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-sm border border-border-strong bg-app px-3 py-1.5 text-xs text-fg transition-colors hover:border-fg-soft"
      >
        {value === "auto" ? "Auto" : value}
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 min-w-[72px] overflow-hidden rounded-sm border border-border-strong bg-app shadow-lg">
          {QUALITY_OPTIONS.map((quality) => (
            <button
              key={quality.value}
              type="button"
              onClick={() => {
                onChange(quality.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                quality.value === value
                  ? "bg-surface text-fg"
                  : "text-fg-muted hover:bg-surface hover:text-fg"
              }`}
            >
              {quality.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpeedDropdown({ value, onChange }: SpeedDropdownProps) {
  return (
    <select
      aria-label="Default playback speed"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="flex-shrink-0 rounded-sm border border-border-strong bg-app px-3 py-1.5 text-xs text-fg transition-colors hover:border-fg-soft"
    >
      {DEFAULT_PLAYBACK_SPEED_OPTIONS.map((speed) => (
        <option key={speed} value={speed}>
          {playbackSpeedLabel(speed)}
        </option>
      ))}
    </select>
  );
}

export function SettingsPlayback() {
  const { settings, update } = useSettings();
  const autoplayCountdownSeconds = Math.min(
    60,
    Math.max(0, Math.round(settings.autoplayCountdownSeconds)),
  );

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>Playback</p>
      <div className={GROUP}>
        <PlaybackToggleRow
          title="Autoplay"
          description="Automatically play the next video"
          checked={settings.autoplay}
          onClick={() => update.mutate({ autoplay: !settings.autoplay })}
        />
        <PlaybackNumberRow
          title="Autoplay countdown"
          description="Seconds before autoplay advances, or 0 for immediate playlists"
          value={autoplayCountdownSeconds}
          min={0}
          max={60}
          onChange={(value) =>
            update.mutate({ autoplayCountdownSeconds: Math.min(60, Math.max(0, value)) })
          }
        />
        <PlaybackToggleRow
          title="Skip playlist autoplay screen"
          description="Play the next playlist item immediately while keeping the countdown for recommendations"
          checked={settings.skipPlaylistAutoplayScreen}
          onClick={() =>
            update.mutate({ skipPlaylistAutoplayScreen: !settings.skipPlaylistAutoplayScreen })
          }
        />
        <PlaybackToggleRow
          title="Audio-only playback"
          description="Load a backend-provided audio stream when available"
          checked={settings.audioOnlyPlayback}
          onClick={() => update.mutate({ audioOnlyPlayback: !settings.audioOnlyPlayback })}
        />
        <div className={PLAYBACK_ROW}>
          <div className="min-w-0 flex flex-col gap-1">
            <span className="text-sm text-fg">Default quality</span>
            <span className="text-xs text-fg-soft">Preferred video resolution</span>
          </div>
          <QualityDropdown
            value={settings.defaultQuality}
            onChange={(q) => update.mutate({ defaultQuality: q })}
          />
        </div>
        <div className={PLAYBACK_ROW}>
          <div className="min-w-0 flex flex-col gap-1">
            <span className="text-sm text-fg">Default playback speed</span>
            <span className="text-xs text-fg-soft">Applied when a video starts</span>
          </div>
          <SpeedDropdown
            value={settings.defaultPlaybackSpeed}
            onChange={(speed) => update.mutate({ defaultPlaybackSpeed: speed })}
          />
        </div>
      </div>
    </section>
  );
}
