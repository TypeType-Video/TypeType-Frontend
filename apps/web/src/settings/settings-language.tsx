import { InterfaceLanguagePicker } from "../components/interface-language-picker";
import { useSettings } from "../hooks/use-settings";
import { m } from "../paraglide/messages.js";
import { LanguageDropdown } from "./language-dropdown";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const CARD = "bg-surface rounded-md border border-border divide-y divide-border";
const ROW = "flex items-center justify-between px-4 py-4";

type ToggleProps = {
  checked: boolean;
  onClick: () => void;
};

function Toggle({ checked, onClick }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={`relative ml-6 h-5 w-10 flex-shrink-0 rounded-full border transition-colors duration-200 ${checked ? "border-fg bg-fg" : "border-border-strong bg-surface-strong"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${checked ? "translate-x-5 bg-surface" : "translate-x-0 bg-fg-muted"}`}
      />
    </button>
  );
}

export function SettingsLanguage() {
  const { settings, update } = useSettings();

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>{m.settings_language_section()}</p>
      <div className={CARD}>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">{m.settings_ui_language_label()}</span>
            <span className="text-xs text-fg-soft">{m.settings_ui_language_description()}</span>
          </div>
          <InterfaceLanguagePicker />
        </div>
        {settings.defaultService === 0 && (
          <div className={ROW}>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-fg">{m.settings_subtitle_default_label()}</span>
              <span className="text-xs text-fg-soft">
                {m.settings_subtitle_default_description()}
              </span>
            </div>
            <Toggle
              checked={settings.subtitlesEnabled}
              onClick={() => update.mutate({ subtitlesEnabled: !settings.subtitlesEnabled })}
            />
          </div>
        )}
        {settings.defaultService === 0 && (
          <div className={ROW}>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-fg">{m.settings_subtitle_language_label()}</span>
              <span className="text-xs text-fg-soft">
                {m.settings_subtitle_language_description()}
              </span>
            </div>
            <LanguageDropdown
              value={settings.defaultSubtitleLanguage}
              onChange={(v) => update.mutate({ defaultSubtitleLanguage: v })}
            />
          </div>
        )}
        {settings.defaultService === 0 && (
          <div className={ROW}>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-fg">{m.settings_audio_language_label()}</span>
              <span className="text-xs text-fg-soft">
                {settings.preferOriginalLanguage
                  ? m.settings_audio_language_ignored()
                  : m.settings_audio_language_description()}
              </span>
            </div>
            <LanguageDropdown
              value={settings.defaultAudioLanguage}
              onChange={(v) => update.mutate({ defaultAudioLanguage: v })}
              disabled={settings.preferOriginalLanguage}
            />
          </div>
        )}
        {settings.defaultService === 0 && (
          <div className={ROW}>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-fg">{m.settings_original_audio_label()}</span>
              <span className="text-xs text-fg-soft">
                {m.settings_original_audio_description()}
              </span>
            </div>
            <Toggle
              checked={settings.preferOriginalLanguage}
              onClick={() =>
                update.mutate({ preferOriginalLanguage: !settings.preferOriginalLanguage })
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
